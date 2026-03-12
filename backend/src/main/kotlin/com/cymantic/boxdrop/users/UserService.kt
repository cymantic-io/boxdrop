package com.cymantic.boxdrop.users

import com.cymantic.boxdrop.common.dto.UpdateProfileRequest
import com.cymantic.boxdrop.common.dto.UserProfileResponse
import com.cymantic.boxdrop.common.exceptions.NotFoundException
import com.cymantic.boxdrop.reviews.ReviewRepository
import com.cymantic.boxdrop.trust.TrustScoreRepository
import jakarta.inject.Singleton
import java.time.Instant
import java.util.UUID

@Singleton
class UserService(
    private val userRepository: UserRepository,
    private val trustScoreRepository: TrustScoreRepository,
    private val reviewRepository: ReviewRepository
) {
    fun getProfile(userId: UUID): UserProfileResponse {
        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }
        val trust = trustScoreRepository.findById(userId).orElse(null)
        val reviews = reviewRepository.findBySellerId(userId)
        val avgRating = if (reviews.isNotEmpty()) reviews.map { it.rating }.average() else null
        return UserProfileResponse(
            id = user.id.toString(), email = user.email, displayName = user.displayName,
            avatarUrl = user.avatarUrl, address = user.address, trustScore = trust?.score, reviewCount = reviews.size,
            avgRating = avgRating, createdAt = user.createdAt
        )
    }

    fun getPublicProfile(userId: UUID): UserProfileResponse = getProfile(userId).copy(email = null)

    fun updateProfile(userId: UUID, request: UpdateProfileRequest): UserProfileResponse {
        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }
        val updated = user.copy(
            displayName = request.displayName ?: user.displayName,
            avatarUrl = request.avatarUrl ?: user.avatarUrl,
            address = request.address ?: user.address,
            updatedAt = Instant.now()
        )
        userRepository.update(updated)
        return getProfile(userId)
    }
}
