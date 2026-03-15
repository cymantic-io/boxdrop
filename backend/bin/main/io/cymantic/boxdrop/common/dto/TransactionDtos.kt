package io.cymantic.boxdrop.common.dto

import io.micronaut.serde.annotation.Serdeable
import java.math.BigDecimal
import java.time.Instant

@Serdeable
data class ClaimRequest(val listingId: String)

@Serdeable
data class ConfirmPickupRequest(val token: String)

@Serdeable
data class TransactionResponse(
    val id: String,
    val listingId: String,
    val listingTitle: String?,
    val buyerId: String,
    val sellerId: String,
    val amount: BigDecimal,
    val platformFee: BigDecimal,
    val status: String,
    val pickupToken: String?,
    val claimedAt: Instant,
    val paidAt: Instant?,
    val confirmedAt: Instant?,
    val completedAt: Instant?,
    val createdAt: Instant
)
