package com.cymantic.boxdrop.offers

import io.micronaut.data.annotation.Id
import io.micronaut.data.annotation.MappedEntity
import io.micronaut.serde.annotation.Serdeable
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

@Serdeable
@MappedEntity("offers")
data class Offer(
    @field:Id val id: UUID,
    val listingId: UUID,
    val threadId: UUID,
    val messageId: UUID,
    val buyerId: UUID,
    val sellerId: UUID,
    val amount: BigDecimal,
    val status: String,
    val previousOfferId: UUID?,
    val createdAt: Instant,
    val updatedAt: Instant,
    val respondedAt: Instant?
)
