package com.cymantic.boxdrop.common.dto

import io.micronaut.serde.annotation.Serdeable
import java.time.Instant

@Serdeable
data class CreateReviewRequest(val transactionId: String, val rating: Int, val comment: String?)

@Serdeable
data class ReviewResponse(
    val id: String,
    val transactionId: String,
    val reviewerId: String,
    val sellerId: String,
    val rating: Int,
    val comment: String?,
    val createdAt: Instant
)
