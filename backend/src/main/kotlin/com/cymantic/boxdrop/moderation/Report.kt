package com.cymantic.boxdrop.moderation

import io.micronaut.data.annotation.Id
import io.micronaut.data.annotation.MappedEntity
import io.micronaut.serde.annotation.Serdeable
import java.time.Instant
import java.util.UUID

@Serdeable
@MappedEntity("reports")
data class Report(
    @field:Id val id: UUID,
    val reporterId: UUID,
    val targetType: String,
    val targetId: UUID,
    val reason: String,
    val status: String,
    val createdAt: Instant,
    val resolvedAt: Instant?
)
