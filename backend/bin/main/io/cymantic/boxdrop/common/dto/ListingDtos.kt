package io.cymantic.boxdrop.common.dto

import io.micronaut.core.annotation.Nullable
import io.micronaut.serde.annotation.Serdeable
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.Instant

@Serdeable
data class CreateListingRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(max = 200, message = "Title must be less than 200 characters")
    val title: String,

    @field:Nullable
    @field:Size(max = 2000, message = "Description must be less than 2000 characters")
    val description: String?,

    @field:NotNull(message = "Starting price is required")
    @field:DecimalMin(value = "0.01", message = "Starting price must be at least 0.01")
    val startingPrice: BigDecimal,

    @field:Nullable
    @field:DecimalMin(value = "0.00", message = "Minimum price cannot be negative")
    val minimumPrice: BigDecimal?,

    @field:NotBlank(message = "Category is required")
    val category: String,

    @field:Nullable
    val condition: String?,

    @field:Nullable
    val imageUrls: List<String>?
)

@Serdeable
data class UpdateListingRequest(
    @field:Size(max = 200, message = "Title must be less than 200 characters")
    val title: String?,

    @field:Size(max = 2000, message = "Description must be less than 2000 characters")
    val description: String?,

    @field:DecimalMin(value = "0.01", message = "Starting price must be at least 0.01")
    val startingPrice: BigDecimal?,

    @field:DecimalMin(value = "0.00", message = "Minimum price cannot be negative")
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
