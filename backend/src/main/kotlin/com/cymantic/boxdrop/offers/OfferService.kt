package com.cymantic.boxdrop.offers

import com.cymantic.boxdrop.common.dto.*
import com.cymantic.boxdrop.common.exceptions.BadRequestException
import com.cymantic.boxdrop.common.exceptions.NotFoundException
import com.cymantic.boxdrop.common.exceptions.UnauthorizedException
import com.cymantic.boxdrop.listings.ListingRepository
import com.cymantic.boxdrop.messaging.Message
import com.cymantic.boxdrop.messaging.MessageRepository
import com.cymantic.boxdrop.messaging.MessageThread
import com.cymantic.boxdrop.messaging.MessageThreadRepository
import com.cymantic.boxdrop.sales.SaleRepository
import com.cymantic.boxdrop.transactions.TransactionService
import jakarta.inject.Singleton
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

@Singleton
class OfferService(
    private val offerRepository: OfferRepository,
    private val listingRepository: ListingRepository,
    private val saleRepository: SaleRepository,
    private val threadRepository: MessageThreadRepository,
    private val messageRepository: MessageRepository,
    private val transactionService: TransactionService
) {
    fun createOffer(buyerId: UUID, request: CreateOfferRequest): CreateOfferResponse {
        val listingId = UUID.fromString(request.listingId)
        val listing = listingRepository.findById(listingId)
            .orElseThrow { NotFoundException("Listing not found") }
        if (listing.status != "AVAILABLE") throw BadRequestException("Listing is not available")

        val sale = saleRepository.findById(listing.saleId)
            .orElseThrow { NotFoundException("Sale not found") }
        if (sale.sellerId == buyerId) throw BadRequestException("Cannot make an offer on your own listing")

        if (request.amount <= BigDecimal.ZERO) throw BadRequestException("Offer amount must be positive")
        if (request.amount >= listing.currentPrice) throw BadRequestException("Offer must be less than the current price. Use Claim instead.")

        // Get or create thread
        val thread = threadRepository.findByBuyerIdAndListingId(buyerId, listingId)
            .orElseGet {
                threadRepository.save(MessageThread(
                    id = UUID.randomUUID(), buyerId = buyerId, sellerId = sale.sellerId,
                    listingId = listingId, createdAt = Instant.now()
                ))
            }

        // Create message
        val message = messageRepository.save(Message(
            id = UUID.randomUUID(), threadId = thread.id, senderId = buyerId,
            content = "Offered \$${request.amount.toPlainString()}", createdAt = Instant.now(), readAt = null
        ))

        // Create offer
        val offer = offerRepository.save(Offer(
            id = UUID.randomUUID(), listingId = listingId, threadId = thread.id,
            messageId = message.id, buyerId = buyerId, sellerId = sale.sellerId,
            amount = request.amount, status = "PENDING", previousOfferId = null,
            createdAt = Instant.now(), updatedAt = Instant.now(), respondedAt = null
        ))

        return CreateOfferResponse(
            thread = toThreadResponse(thread, buyerId),
            offer = toOfferResponse(offer)
        )
    }

    fun acceptOffer(offerId: UUID, userId: UUID): OfferResponse {
        val offer = offerRepository.findById(offerId)
            .orElseThrow { NotFoundException("Offer not found") }
        if (offer.status != "PENDING") throw BadRequestException("Offer is no longer pending")

        // Only the recipient can accept (not the person who sent the offer message)
        val msg = messageRepository.findById(offer.messageId).orElse(null)
        if (msg == null || msg.senderId == userId) throw UnauthorizedException("Only the other party can accept")

        val listing = listingRepository.findById(offer.listingId)
            .orElseThrow { NotFoundException("Listing not found") }
        if (listing.status != "AVAILABLE") throw BadRequestException("Listing is no longer available")

        // Create transaction via TransactionService
        transactionService.claimAtPrice(offer.buyerId, offer.listingId, offer.amount)

        // Update offer
        val accepted = offer.copy(status = "ACCEPTED", updatedAt = Instant.now(), respondedAt = Instant.now())
        offerRepository.update(accepted)

        // Reject other pending offers on same listing
        offerRepository.rejectOtherPending(offer.listingId, offer.id, "REJECTED")

        // Post acceptance message
        messageRepository.save(Message(
            id = UUID.randomUUID(), threadId = offer.threadId, senderId = userId,
            content = "Accepted offer of \$${offer.amount.toPlainString()}", createdAt = Instant.now(), readAt = null
        ))

        return toOfferResponse(accepted)
    }

    fun rejectOffer(offerId: UUID, userId: UUID): OfferResponse {
        val offer = offerRepository.findById(offerId)
            .orElseThrow { NotFoundException("Offer not found") }
        if (offer.status != "PENDING") throw BadRequestException("Offer is no longer pending")

        val msg = messageRepository.findById(offer.messageId).orElse(null)
        if (msg == null || msg.senderId == userId) throw UnauthorizedException("Only the other party can reject")

        val rejected = offer.copy(status = "REJECTED", updatedAt = Instant.now(), respondedAt = Instant.now())
        offerRepository.update(rejected)

        messageRepository.save(Message(
            id = UUID.randomUUID(), threadId = offer.threadId, senderId = userId,
            content = "Rejected offer of \$${offer.amount.toPlainString()}", createdAt = Instant.now(), readAt = null
        ))

        return toOfferResponse(rejected)
    }

    fun counterOffer(offerId: UUID, userId: UUID, request: CounterOfferRequest): CreateOfferResponse {
        val offer = offerRepository.findById(offerId)
            .orElseThrow { NotFoundException("Offer not found") }
        if (offer.status != "PENDING") throw BadRequestException("Offer is no longer pending")

        val msg = messageRepository.findById(offer.messageId).orElse(null)
        if (msg == null || msg.senderId == userId) throw UnauthorizedException("Only the other party can counter")

        if (request.amount <= BigDecimal.ZERO) throw BadRequestException("Counter amount must be positive")

        // Supersede old offer
        val superseded = offer.copy(status = "SUPERSEDED", updatedAt = Instant.now(), respondedAt = Instant.now())
        offerRepository.update(superseded)

        // Create new message and offer
        val thread = threadRepository.findById(offer.threadId)
            .orElseThrow { NotFoundException("Thread not found") }

        val newMessage = messageRepository.save(Message(
            id = UUID.randomUUID(), threadId = thread.id, senderId = userId,
            content = "Counteroffered \$${request.amount.toPlainString()}", createdAt = Instant.now(), readAt = null
        ))

        val newOffer = offerRepository.save(Offer(
            id = UUID.randomUUID(), listingId = offer.listingId, threadId = thread.id,
            messageId = newMessage.id, buyerId = offer.buyerId, sellerId = offer.sellerId,
            amount = request.amount, status = "PENDING", previousOfferId = offer.id,
            createdAt = Instant.now(), updatedAt = Instant.now(), respondedAt = null
        ))

        return CreateOfferResponse(
            thread = toThreadResponse(thread, userId),
            offer = toOfferResponse(newOffer)
        )
    }

    fun getOffersByThread(threadId: UUID): Map<UUID, Offer> {
        return offerRepository.findByThreadIdOrderByCreatedAt(threadId)
            .associateBy { it.messageId }
    }

    private fun toOfferResponse(offer: Offer) = OfferResponse(
        id = offer.id.toString(), listingId = offer.listingId.toString(),
        amount = offer.amount, status = offer.status,
        previousOfferId = offer.previousOfferId?.toString(),
        createdAt = offer.createdAt, respondedAt = offer.respondedAt
    )

    private fun toThreadResponse(thread: MessageThread, userId: UUID): ThreadResponse {
        val messages = messageRepository.findByThreadIdOrderByCreatedAt(thread.id)
        val lastMsg = messages.lastOrNull()
        val unread = messages.count { it.senderId != userId && it.readAt == null }
        val listingTitle = listingRepository.findById(thread.listingId).orElse(null)?.title
        return ThreadResponse(
            id = thread.id.toString(), buyerId = thread.buyerId.toString(),
            sellerId = thread.sellerId.toString(), listingId = thread.listingId.toString(),
            listingTitle = listingTitle, otherUserName = null,
            lastMessage = lastMsg?.content, lastMessageAt = lastMsg?.createdAt,
            unreadCount = unread, createdAt = thread.createdAt
        )
    }
}
