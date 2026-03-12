package com.cymantic.boxdrop.listings

import io.micronaut.data.annotation.Id
import io.micronaut.data.annotation.MappedEntity
import io.micronaut.serde.annotation.Serdeable
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

@Serdeable
@MappedEntity("listings")
data class Listing(
    @field:Id val id: UUID,
    val saleId: UUID,
    val title: String,
    val description: String?,
    val startingPrice: BigDecimal,
    val minimumPrice: BigDecimal,
    val currentPrice: BigDecimal,
    val category: String,
    val condition: String?,
    val status: String,
    val createdAt: Instant,
    val updatedAt: Instant
)
