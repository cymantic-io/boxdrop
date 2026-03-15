package io.cymantic.boxdrop.transactions

import io.micronaut.data.annotation.Id
import io.micronaut.data.annotation.MappedEntity
import io.micronaut.serde.annotation.Serdeable
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

@Serdeable
@MappedEntity("transactions")
data class Transaction(
    @field:Id val id: UUID,
    val listingId: UUID,
    val buyerId: UUID,
    val sellerId: UUID,
    val amount: BigDecimal,
    val platformFee: BigDecimal,
    val status: String,
    val pickupToken: String?,
    val stripePaymentId: String?,
    val claimedAt: Instant,
    val paidAt: Instant?,
    val confirmedAt: Instant?,
    val completedAt: Instant?,
    val cancelledAt: Instant?,
    val createdAt: Instant
)
