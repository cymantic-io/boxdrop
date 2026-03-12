package com.cymantic.boxdrop.common.dto

import io.micronaut.serde.annotation.Serdeable
import java.math.BigDecimal
import java.time.Instant

@Serdeable
data class CreateThreadRequest(val listingId: String)

@Serdeable
data class SendMessageRequest(val content: String)

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
    val listingId: String,
    val amount: BigDecimal
)

@Serdeable
data class CounterOfferRequest(
    val amount: BigDecimal
)
