package com.cymantic.boxdrop.trust

import io.micronaut.data.annotation.Id
import io.micronaut.data.annotation.MappedEntity
import io.micronaut.serde.annotation.Serdeable
import java.time.Instant
import java.util.UUID

@Serdeable
@MappedEntity("user_trust_scores")
data class UserTrustScore(
    @field:Id val userId: UUID,
    val score: Int,
    val successfulSales: Int,
    val successfulPurchases: Int,
    val reportsReceived: Int,
    val reportsConfirmed: Int,
    val emailVerified: Boolean,
    val phoneVerified: Boolean,
    val updatedAt: Instant
)
