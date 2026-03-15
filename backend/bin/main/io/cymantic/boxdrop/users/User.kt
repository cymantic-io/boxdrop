package io.cymantic.boxdrop.users

import io.micronaut.data.annotation.Id
import io.micronaut.data.annotation.MappedEntity
import io.micronaut.serde.annotation.Serdeable
import java.time.Instant
import java.util.UUID

@Serdeable
@MappedEntity("users")
data class User(
    @field:Id val id: UUID,
    val email: String,
    val passwordHash: String?,
    val displayName: String?,
    val avatarUrl: String?,
    val address: String?,
    val createdAt: Instant,
    val updatedAt: Instant
)
