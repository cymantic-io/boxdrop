package io.cymantic.boxdrop.auth

import io.micronaut.data.annotation.Id
import io.micronaut.data.annotation.MappedEntity
import io.micronaut.serde.annotation.Serdeable
import java.time.Instant
import java.util.UUID

@Serdeable
@MappedEntity("verification_methods")
data class VerificationMethod(
    @field:Id val id: UUID,
    val userId: UUID,
    val methodType: String,
    val enabled: Boolean,
    val totpSecret: String?,
    val phoneNumber: String?,
    val createdAt: Instant
)
