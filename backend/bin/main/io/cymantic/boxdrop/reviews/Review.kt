package io.cymantic.boxdrop.reviews

import io.micronaut.data.annotation.Id
import io.micronaut.data.annotation.MappedEntity
import io.micronaut.serde.annotation.Serdeable
import java.time.Instant
import java.util.UUID

@Serdeable
@MappedEntity("reviews")
data class Review(
    @field:Id val id: UUID,
    val transactionId: UUID,
    val reviewerId: UUID,
    val sellerId: UUID,
    val rating: Int,
    val comment: String?,
    val createdAt: Instant
)
