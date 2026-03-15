package io.cymantic.boxdrop.messaging

import io.micronaut.data.annotation.Id
import io.micronaut.data.annotation.MappedEntity
import io.micronaut.serde.annotation.Serdeable
import java.time.Instant
import java.util.UUID

@Serdeable
@MappedEntity("messages")
data class Message(
    @field:Id val id: UUID,
    val threadId: UUID,
    val senderId: UUID,
    val content: String,
    val createdAt: Instant,
    val readAt: Instant?
)
