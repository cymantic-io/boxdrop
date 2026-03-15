package io.cymantic.boxdrop.trust

import jakarta.inject.Singleton
import java.time.Instant
import java.util.UUID

@Singleton
class TrustService(private val trustScoreRepository: TrustScoreRepository) {

    fun initializeScore(userId: UUID) {
        trustScoreRepository.save(UserTrustScore(
            userId, score = 50, successfulSales = 0, successfulPurchases = 0,
            reportsReceived = 0, reportsConfirmed = 0, emailVerified = false,
            phoneVerified = false, updatedAt = Instant.now()
        ))
    }

    fun onSuccessfulSale(sellerId: UUID) {
        trustScoreRepository.findById(sellerId).ifPresent {
            trustScoreRepository.update(it.copy(
                successfulSales = it.successfulSales + 1,
                score = (it.score + 5).coerceAtMost(100), updatedAt = Instant.now()
            ))
        }
    }

    fun onSuccessfulPurchase(buyerId: UUID) {
        trustScoreRepository.findById(buyerId).ifPresent {
            trustScoreRepository.update(it.copy(
                successfulPurchases = it.successfulPurchases + 1,
                score = (it.score + 3).coerceAtMost(100), updatedAt = Instant.now()
            ))
        }
    }

    fun onReportConfirmed(userId: UUID) {
        trustScoreRepository.findById(userId).ifPresent {
            trustScoreRepository.update(it.copy(
                reportsConfirmed = it.reportsConfirmed + 1,
                score = (it.score - 20).coerceAtLeast(0), updatedAt = Instant.now()
            ))
        }
    }
}
