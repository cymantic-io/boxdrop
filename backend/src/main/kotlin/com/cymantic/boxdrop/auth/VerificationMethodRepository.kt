package com.cymantic.boxdrop.auth

import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository
import java.util.Optional
import java.util.UUID

@JdbcRepository(dialect = Dialect.POSTGRES)
interface VerificationMethodRepository : CrudRepository<VerificationMethod, UUID> {
    fun findByUserId(userId: UUID): List<VerificationMethod>
    fun findByUserIdAndMethodType(userId: UUID, methodType: String): Optional<VerificationMethod>
    fun findByUserIdAndEnabled(userId: UUID, enabled: Boolean): List<VerificationMethod>
}
