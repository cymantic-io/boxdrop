package com.cymantic.boxdrop.common.dto

import io.micronaut.serde.annotation.Serdeable
import java.time.Instant

@Serdeable
data class CreateSaleRequest(
    val title: String,
    val description: String?,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val startsAt: Instant,
    val endsAt: Instant
)

@Serdeable
data class UpdateSaleRequest(
    val title: String?,
    val description: String?,
    val address: String?,
    val latitude: Double?,
    val longitude: Double?,
    val startsAt: Instant?,
    val endsAt: Instant?
)

@Serdeable
data class SaleResponse(
    val id: String,
    val sellerId: String,
    val title: String,
    val description: String?,
    val address: String?,
    val latitude: Double,
    val longitude: Double,
    val startsAt: Instant,
    val endsAt: Instant,
    val status: String,
    val listingCount: Int?,
    val createdAt: Instant
)
