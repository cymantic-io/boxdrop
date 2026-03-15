package io.cymantic.boxdrop.common.dto

import io.micronaut.core.annotation.Nullable
import io.micronaut.serde.annotation.Serdeable
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.Instant

@Serdeable
data class CreateSaleRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(max = 200, message = "Title must be less than 200 characters")
    val title: String,

    @field:Nullable
    @field:Size(max = 2000, message = "Description must be less than 2000 characters")
    val description: String?,

    @field:NotBlank(message = "Address is required")
    @field:Size(max = 500, message = "Address must be less than 500 characters")
    val address: String,

    @field:NotNull(message = "Latitude is required")
    @field:DecimalMin(value = "-90.0", message = "Latitude must be at least -90")
    @field:DecimalMax(value = "90.0", message = "Latitude must be at most 90")
    val latitude: Double,

    @field:NotNull(message = "Longitude is required")
    @field:DecimalMin(value = "-180.0", message = "Longitude must be at least -180")
    @field:DecimalMax(value = "180.0", message = "Longitude must be at most 180")
    val longitude: Double,

    @field:NotNull(message = "Start date is required")
    val startsAt: Instant,

    @field:NotNull(message = "End date is required")
    val endsAt: Instant
)

@Serdeable
data class UpdateSaleRequest(
    @field:Size(max = 200, message = "Title must be less than 200 characters")
    val title: String?,

    @field:Size(max = 2000, message = "Description must be less than 2000 characters")
    val description: String?,

    @field:Size(max = 500, message = "Address must be less than 500 characters")
    val address: String?,

    @field:DecimalMin(value = "-90.0", message = "Latitude must be at least -90")
    @field:DecimalMax(value = "90.0", message = "Latitude must be at most 90")
    val latitude: Double?,

    @field:DecimalMin(value = "-180.0", message = "Longitude must be at least -180")
    @field:DecimalMax(value = "180.0", message = "Longitude must be at most 180")
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
