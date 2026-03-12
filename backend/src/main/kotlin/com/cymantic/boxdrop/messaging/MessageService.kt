package com.cymantic.boxdrop.messaging

import com.cymantic.boxdrop.common.dto.*
import com.cymantic.boxdrop.common.exceptions.NotFoundException
import com.cymantic.boxdrop.common.exceptions.UnauthorizedException
import com.cymantic.boxdrop.listings.ListingRepository
import com.cymantic.boxdrop.offers.Offer
import com.cymantic.boxdrop.offers.OfferRepository
import com.cymantic.boxdrop.sales.SaleRepository
import com.cymantic.boxdrop.users.UserRepository
import jakarta.inject.Singleton
import java.time.Instant
import java.util.UUID

@Singleton
class MessageService(
    private val threadRepository: MessageThreadRepository,
    private val messageRepository: MessageRepository,
    private val listingRepository: ListingRepository,
    private val saleRepository: SaleRepository,
    private val userRepository: UserRepository,
    private val offerRepository: OfferRepository
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

    fun getThreadDetail(threadId: UUID, userId: UUID): ThreadDetailResponse {
        val thread = threadRepository.findById(threadId)
            .orElseThrow { NotFoundException("Thread not found") }
        if (thread.buyerId != userId && thread.sellerId != userId)
            throw UnauthorizedException("Not your conversation")
        messageRepository.markAsRead(threadId, userId)
        val messages = messageRepository.findByThreadIdOrderByCreatedAt(threadId)
        val offersByMessageId = offerRepository.findByThreadIdOrderByCreatedAt(threadId)
            .associateBy { it.messageId }
        val enrichedMessages = messages.map { m ->
            val offer = offersByMessageId[m.id]
            toMessageResponse(m, offer)
        }
        return ThreadDetailResponse(
            thread = toResponse(thread, userId),
            messages = enrichedMessages
        )
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
        val lastMsg = messages.lastOrNull()
        val unread = messages.count { it.senderId != userId && it.readAt == null }
        val listingTitle = listingRepository.findById(thread.listingId).orElse(null)?.title
        val otherUserId = if (thread.buyerId == userId) thread.sellerId else thread.buyerId
        val otherUserName = userRepository.findById(otherUserId).orElse(null)?.displayName
        return ThreadResponse(
            id = thread.id.toString(), buyerId = thread.buyerId.toString(),
            sellerId = thread.sellerId.toString(), listingId = thread.listingId.toString(),
            listingTitle = listingTitle, otherUserName = otherUserName,
            lastMessage = lastMsg?.content, lastMessageAt = lastMsg?.createdAt,
            unreadCount = unread, createdAt = thread.createdAt
        )
    }

    private fun toMessageResponse(m: Message, offer: Offer? = null) = MessageResponse(
        id = m.id.toString(), threadId = m.threadId.toString(), senderId = m.senderId.toString(),
        content = m.content, createdAt = m.createdAt, readAt = m.readAt,
        offer = offer?.let {
            OfferResponse(
                id = it.id.toString(), listingId = it.listingId.toString(),
                amount = it.amount, status = it.status,
                previousOfferId = it.previousOfferId?.toString(),
                createdAt = it.createdAt, respondedAt = it.respondedAt
            )
        }
    )
}
