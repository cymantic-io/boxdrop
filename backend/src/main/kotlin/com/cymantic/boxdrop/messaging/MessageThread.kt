package com.cymantic.boxdrop.messaging

import io.micronaut.data.annotation.Id
import io.micronaut.data.annotation.MappedEntity
import io.micronaut.serde.annotation.Serdeable
import java.time.Instant
import java.util.UUID

@Serdeable
@MappedEntity("messaging_threads")
data class MessageThread(
    @field:Id val id: UUID,
    val buyerId: UUID,
    val sellerId: UUID,
    val listingId: UUID,
    val createdAt: Instant
)
