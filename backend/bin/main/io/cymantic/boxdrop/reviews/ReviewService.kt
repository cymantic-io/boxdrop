package io.cymantic.boxdrop.reviews

import io.cymantic.boxdrop.common.dto.CreateReviewRequest
import io.cymantic.boxdrop.common.dto.ReviewResponse
import io.cymantic.boxdrop.common.exceptions.BadRequestException
import io.cymantic.boxdrop.common.exceptions.NotFoundException
import io.cymantic.boxdrop.transactions.TransactionRepository
import io.cymantic.boxdrop.trust.TrustService
import jakarta.inject.Singleton
import java.time.Instant
import java.util.UUID

@Singleton
class ReviewService(
    private val reviewRepository: ReviewRepository,
    private val transactionRepository: TransactionRepository,
    private val trustService: TrustService
) {
    fun create(reviewerId: UUID, request: CreateReviewRequest): ReviewResponse {
        val txId = UUID.fromString(request.transactionId)
        val tx = transactionRepository.findById(txId).orElseThrow { NotFoundException("Transaction not found") }
        if (tx.buyerId != reviewerId) throw BadRequestException("Only buyers can leave reviews")
        if (tx.status != "COMPLETED") throw BadRequestException("Transaction must be completed")
        if (reviewRepository.existsByTransactionId(txId)) throw BadRequestException("Review already exists")
        if (request.rating !in 1..5) throw BadRequestException("Rating must be 1-5")
        val review = reviewRepository.save(Review(
            UUID.randomUUID(), txId, reviewerId, tx.sellerId, request.rating, request.comment, Instant.now()
        ))
        return toResponse(review)
    }

    fun getForSeller(sellerId: UUID): List<ReviewResponse> =
        reviewRepository.findBySellerId(sellerId).map { toResponse(it) }

    private fun toResponse(r: Review) = ReviewResponse(
        r.id.toString(), r.transactionId.toString(), r.reviewerId.toString(),
        r.sellerId.toString(), r.rating, r.comment, r.createdAt
    )
}
