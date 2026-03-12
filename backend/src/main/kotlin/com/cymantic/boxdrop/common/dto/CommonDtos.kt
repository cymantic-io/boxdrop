package com.cymantic.boxdrop.common.dto

import io.micronaut.serde.annotation.Serdeable
import java.time.Instant

@Serdeable
data class PaginatedResponse<T>(
    val data: List<T>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int
)

@Serdeable
data class ApiResponse<T>(val data: T)

@Serdeable
data class ErrorResponse(val error: String, val message: String, val status: Int)

@Serdeable
data class ReportRequest(val targetType: String, val targetId: String, val reason: String)

@Serdeable
data class UserProfileResponse(
    val id: String,
    val email: String?,
    val displayName: String?,
    val avatarUrl: String?,
    val address: String?,
    val trustScore: Int?,
    val reviewCount: Int?,
    val avgRating: Double?,
    val createdAt: Instant
)

@Serdeable
data class UpdateProfileRequest(val displayName: String?, val avatarUrl: String?, val address: String?)

