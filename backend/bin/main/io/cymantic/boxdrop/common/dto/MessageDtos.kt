package io.cymantic.boxdrop.common.dto

import io.micronaut.serde.annotation.Serdeable
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.Instant

@Serdeable
data class CreateThreadRequest(
    @field:NotBlank(message = "Listing ID is required")
    val listingId: String
)

@Serdeable
data class SendMessageRequest(
    @field:NotBlank(message = "Message content is required")
    @field:Size(max = 2000, message = "Message must be less than 2000 characters")
    val content: String
)

@Serdeable
data class ThreadResponse(
    val id: String,
    val buyerId: String,
    val sellerId: String,
    val listingId: String,
    val listingTitle: String?,
    val otherUserName: String?,
    val lastMessage: String?,
    val lastMessageAt: Instant?,
    val unreadCount: Int,
    val createdAt: Instant
)

@Serdeable
data class ThreadDetailResponse(
    val thread: ThreadResponse,
    val messages: List<MessageResponse>
)

@Serdeable
data class MessageResponse(
    val id: String,
    val threadId: String,
    val senderId: String,
    val content: String,
    val createdAt: Instant,
    val readAt: Instant?,
    val offer: OfferResponse? = null
)

@Serdeable
data class OfferResponse(
    val id: String,
    val listingId: String,
    val amount: BigDecimal,
    val status: String,
    val previousOfferId: String?,
    val createdAt: Instant,
    val respondedAt: Instant?
)

@Serdeable
data class CreateOfferRequest(
    @field:NotBlank(message = "Listing ID is required")
    val listingId: String,

    @field:NotBlank(message = "Amount is required")
    @field:DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
    val amount: BigDecimal
)

@Serdeable
data class CounterOfferRequest(
    @field:NotBlank(message = "Amount is required")
    @field:DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
    val amount: BigDecimal
)
