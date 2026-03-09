package com.boxdrop.common.dto

import io.micronaut.serde.annotation.Serdeable
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
    val lastMessage: MessageResponse?,
    val unreadCount: Int,
    val createdAt: Instant
)

@Serdeable
data class MessageResponse(
    val id: String,
    val threadId: String,
    val senderId: String,
    val content: String,
    val createdAt: Instant,
    val readAt: Instant?
)
