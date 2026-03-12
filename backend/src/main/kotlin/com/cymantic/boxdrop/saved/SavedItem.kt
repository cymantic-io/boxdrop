package com.cymantic.boxdrop.saved

import io.micronaut.data.annotation.Id
import io.micronaut.data.annotation.MappedEntity
import io.micronaut.serde.annotation.Serdeable
import java.time.Instant
import java.util.UUID

@Serdeable
@MappedEntity("saved_items")
data class SavedItem(
    @field:Id val id: UUID,
    val userId: UUID,
    val listingId: UUID,
    val createdAt: Instant
)
