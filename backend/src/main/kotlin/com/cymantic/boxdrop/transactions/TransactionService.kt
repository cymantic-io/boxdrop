package com.cymantic.boxdrop.transactions

import com.cymantic.boxdrop.common.dto.*
import com.cymantic.boxdrop.common.exceptions.BadRequestException
import com.cymantic.boxdrop.common.exceptions.NotFoundException
import com.cymantic.boxdrop.common.exceptions.UnauthorizedException
import com.cymantic.boxdrop.listings.ListingRepository
import com.cymantic.boxdrop.sales.SaleRepository
import com.cymantic.boxdrop.trust.TrustService
import jakarta.inject.Singleton
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.Instant
import java.util.UUID

@Singleton
class TransactionService(
    private val transactionRepository: TransactionRepository,
    private val listingRepository: ListingRepository,
    private val saleRepository: SaleRepository,
    private val stripeService: StripeService,
    private val trustService: TrustService
) {
    fun claim(buyerId: UUID, request: ClaimRequest): TransactionResponse {
        val listingId = UUID.fromString(request.listingId)
        val listing = listingRepository.findById(listingId)
            .orElseThrow { NotFoundException("Listing not found") }
        if (listing.status != "AVAILABLE") throw BadRequestException("Listing is not available")

        val active = transactionRepository.findByListingIdAndStatusIn(
            listingId, listOf("CLAIMED", "PAYMENT_PENDING", "PAID"))
        if (active.isNotEmpty()) throw BadRequestException("Listing already claimed")

        val sale = saleRepository.findById(listing.saleId)
            .orElseThrow { NotFoundException("Sale not found") }
        if (sale.sellerId == buyerId) throw BadRequestException("Cannot buy your own listing")

        val platformFee = listing.currentPrice.multiply(BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP)
        val transaction = transactionRepository.save(Transaction(
            id = UUID.randomUUID(), listingId = listingId, buyerId = buyerId,
            sellerId = sale.sellerId, amount = listing.currentPrice, platformFee = platformFee,
            status = "CLAIMED", pickupToken = generatePickupToken(), stripePaymentId = null,
            claimedAt = Instant.now(), paidAt = null, confirmedAt = null,
            completedAt = null, cancelledAt = null, createdAt = Instant.now()
        ))
        listingRepository.updateStatus(listingId, "CLAIMED")
        return toResponse(transaction)
    }

    fun claimAtPrice(buyerId: UUID, listingId: UUID, amount: BigDecimal): TransactionResponse {
        val listing = listingRepository.findById(listingId)
            .orElseThrow { NotFoundException("Listing not found") }
        if (listing.status != "AVAILABLE") throw BadRequestException("Listing is not available")

        val active = transactionRepository.findByListingIdAndStatusIn(
            listingId, listOf("CLAIMED", "PAYMENT_PENDING", "PAID"))
        if (active.isNotEmpty()) throw BadRequestException("Listing already claimed")

        val sale = saleRepository.findById(listing.saleId)
            .orElseThrow { NotFoundException("Sale not found") }

        val platformFee = amount.multiply(BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP)
        val transaction = transactionRepository.save(Transaction(
            id = UUID.randomUUID(), listingId = listingId, buyerId = buyerId,
            sellerId = sale.sellerId, amount = amount, platformFee = platformFee,
            status = "CLAIMED", pickupToken = generatePickupToken(), stripePaymentId = null,
            claimedAt = Instant.now(), paidAt = null, confirmedAt = null,
            completedAt = null, cancelledAt = null, createdAt = Instant.now()
        ))
        listingRepository.updateStatus(listingId, "CLAIMED")
        return toResponse(transaction)
    }

    fun confirmPayment(transactionId: UUID, buyerId: UUID): TransactionResponse {
        val t = transactionRepository.findById(transactionId)
            .orElseThrow { NotFoundException("Transaction not found") }
        if (t.buyerId != buyerId) throw UnauthorizedException("Not your transaction")
        if (t.status != "CLAIMED") throw BadRequestException("Invalid transaction state")
        val updated = t.copy(status = "PAID", paidAt = Instant.now())
        transactionRepository.update(updated)
        return toResponse(updated)
    }

    fun confirmPickup(transactionId: UUID, sellerId: UUID, request: ConfirmPickupRequest): TransactionResponse {
        val t = transactionRepository.findById(transactionId)
            .orElseThrow { NotFoundException("Transaction not found") }
        if (t.sellerId != sellerId) throw UnauthorizedException("Not your transaction")
        if (t.status != "PAID") throw BadRequestException("Payment not confirmed yet")
        if (t.pickupToken != request.token) throw BadRequestException("Invalid pickup token")
        val updated = t.copy(status = "COMPLETED", confirmedAt = Instant.now(), completedAt = Instant.now())
        transactionRepository.update(updated)
        listingRepository.updateStatus(t.listingId, "SOLD")
        trustService.onSuccessfulSale(t.sellerId)
        trustService.onSuccessfulPurchase(t.buyerId)
        return toResponse(updated)
    }

    fun cancel(transactionId: UUID, userId: UUID): TransactionResponse {
        val t = transactionRepository.findById(transactionId)
            .orElseThrow { NotFoundException("Transaction not found") }
        if (t.buyerId != userId && t.sellerId != userId) throw UnauthorizedException("Not your transaction")
        if (t.status in listOf("COMPLETED", "CANCELLED", "REFUNDED"))
            throw BadRequestException("Cannot cancel in ${t.status} state")
        val updated = t.copy(status = "CANCELLED", cancelledAt = Instant.now())
        transactionRepository.update(updated)
        listingRepository.updateStatus(t.listingId, "AVAILABLE")
        return toResponse(updated)
    }

    fun getByUser(userId: UUID): List<TransactionResponse> {
        val all = (transactionRepository.findByBuyerId(userId) + transactionRepository.findBySellerId(userId))
            .distinctBy { it.id }
        return all.map { toResponse(it) }
    }

    fun getById(transactionId: UUID, userId: UUID): TransactionResponse {
        val t = transactionRepository.findById(transactionId)
            .orElseThrow { NotFoundException("Transaction not found") }
        if (t.buyerId != userId && t.sellerId != userId) throw UnauthorizedException("Not your transaction")
        return toResponse(t)
    }

    private fun generatePickupToken(): String =
        (1..8).map { "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".random() }.joinToString("")

    private fun toResponse(t: Transaction): TransactionResponse {
        val listingTitle = runCatching { listingRepository.findById(t.listingId).orElse(null)?.title }.getOrNull()
        return TransactionResponse(
            id = t.id.toString(), listingId = t.listingId.toString(), listingTitle = listingTitle,
            buyerId = t.buyerId.toString(), sellerId = t.sellerId.toString(),
            amount = t.amount, platformFee = t.platformFee,
            status = t.status, pickupToken = t.pickupToken, claimedAt = t.claimedAt,
            paidAt = t.paidAt, confirmedAt = t.confirmedAt, completedAt = t.completedAt,
            createdAt = t.createdAt
        )
    }
}
