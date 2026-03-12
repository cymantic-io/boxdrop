package com.cymantic.boxdrop.listings

import io.micronaut.data.annotation.Id
import io.micronaut.data.annotation.MappedEntity
import io.micronaut.serde.annotation.Serdeable
import java.time.Instant
import java.util.UUID

@Serdeable
@MappedEntity("listing_images")
data class ListingImage(
    @field:Id val id: UUID,
    val listingId: UUID,
    val imageUrl: String,
    val sortOrder: Int,
    val createdAt: Instant
)
