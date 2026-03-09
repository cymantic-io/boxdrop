package com.boxdrop.messaging

import com.boxdrop.common.dto.*
import com.boxdrop.common.exceptions.NotFoundException
import com.boxdrop.common.exceptions.UnauthorizedException
import com.boxdrop.listings.ListingRepository
import com.boxdrop.sales.SaleRepository
import jakarta.inject.Singleton
import java.time.Instant
import java.util.UUID

@Singleton
class MessageService(
    private val threadRepository: MessageThreadRepository,
    private val messageRepository: MessageRepository,
    private val listingRepository: ListingRepository,
    private val saleRepository: SaleRepository
) {
    fun getOrCreateThread(userId: UUID, request: CreateThreadRequest): ThreadResponse {
        val listingId = UUID.fromString(request.listingId)
        val listing = listingRepository.findById(listingId)
            .orElseThrow { NotFoundException("Listing not found") }
        val sale = saleRepository.findById(listing.saleId)
            .orElseThrow { NotFoundException("Sale not found") }
        val existing = threadRepository.findByBuyerIdAndListingId(userId, listingId)
        if (existing.isPresent) return toResponse(existing.get(), userId)
        val thread = threadRepository.save(MessageThread(
            id = UUID.randomUUID(), buyerId = userId, sellerId = sale.sellerId,
            listingId = listingId, createdAt = Instant.now()
        ))
        return toResponse(thread, userId)
    }

    fun getThreads(userId: UUID): List<ThreadResponse> =
        threadRepository.findByBuyerIdOrSellerId(userId, userId).map { toResponse(it, userId) }

    fun getMessages(threadId: UUID, userId: UUID): List<MessageResponse> {
        val thread = threadRepository.findById(threadId)
            .orElseThrow { NotFoundException("Thread not found") }
        if (thread.buyerId != userId && thread.sellerId != userId)
            throw UnauthorizedException("Not your conversation")
        messageRepository.markAsRead(threadId, userId)
        return messageRepository.findByThreadIdOrderByCreatedAt(threadId).map { toMessageResponse(it) }
    }

    fun sendMessage(threadId: UUID, senderId: UUID, request: SendMessageRequest): MessageResponse {
        val thread = threadRepository.findById(threadId)
            .orElseThrow { NotFoundException("Thread not found") }
        if (thread.buyerId != senderId && thread.sellerId != senderId)
            throw UnauthorizedException("Not your conversation")
        val message = messageRepository.save(Message(
            id = UUID.randomUUID(), threadId = threadId, senderId = senderId,
            content = request.content, createdAt = Instant.now(), readAt = null
        ))
        return toMessageResponse(message)
    }

    private fun toResponse(thread: MessageThread, userId: UUID): ThreadResponse {
        val messages = messageRepository.findByThreadIdOrderByCreatedAt(thread.id)
        val lastMessage = messages.lastOrNull()?.let { toMessageResponse(it) }
        val unread = messages.count { it.senderId != userId && it.readAt == null }
        return ThreadResponse(
            id = thread.id.toString(), buyerId = thread.buyerId.toString(),
            sellerId = thread.sellerId.toString(), listingId = thread.listingId.toString(),
            lastMessage = lastMessage, unreadCount = unread, createdAt = thread.createdAt
        )
    }

    private fun toMessageResponse(m: Message) = MessageResponse(
        id = m.id.toString(), threadId = m.threadId.toString(), senderId = m.senderId.toString(),
        content = m.content, createdAt = m.createdAt, readAt = m.readAt
    )
}
