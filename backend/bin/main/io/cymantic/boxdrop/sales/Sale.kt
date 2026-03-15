package io.cymantic.boxdrop.sales

import io.micronaut.data.annotation.Id
import io.micronaut.data.annotation.MappedEntity
import io.micronaut.serde.annotation.Serdeable
import java.time.Instant
import java.util.UUID

@Serdeable
@MappedEntity("sales")
data class Sale(
    @field:Id val id: UUID,
    val sellerId: UUID,
    val title: String,
    val description: String?,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val startsAt: Instant,
    val endsAt: Instant,
    val status: String,
    val createdAt: Instant,
    val updatedAt: Instant
)
