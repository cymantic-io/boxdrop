package com.cymantic.boxdrop.common.dto

import io.micronaut.serde.annotation.Serdeable
import java.math.BigDecimal
import java.time.Instant

@Serdeable
data class CreateListingRequest(
    val title: String,
    val description: String?,
    val startingPrice: BigDecimal,
    val minimumPrice: BigDecimal?,
    val category: String,
    val condition: String?,
    val imageUrls: List<String>?
)

@Serdeable
data class UpdateListingRequest(
    val title: String?,
    val description: String?,
    val startingPrice: BigDecimal?,
    val minimumPrice: BigDecimal?,
    val category: String?,
    val condition: String?
)

@Serdeable
data class ListingResponse(
    val id: String,
    val saleId: String,
    val title: String,
    val description: String?,
    val startingPrice: BigDecimal,
    val minimumPrice: BigDecimal,
    val currentPrice: BigDecimal,
    val category: String,
    val condition: String?,
    val status: String,
    val images: List<ListingImageResponse>,
    val createdAt: Instant
)

@Serdeable
data class ListingImageResponse(val id: String, val imageUrl: String, val sortOrder: Int)

@Serdeable
data class UpdateListingStatusRequest(val status: String)

@Serdeable
data class MapListingResponse(
    val id: String,
    val lat: Double,
    val lng: Double,
    val price: BigDecimal,
    val thumbnail: String?
)
