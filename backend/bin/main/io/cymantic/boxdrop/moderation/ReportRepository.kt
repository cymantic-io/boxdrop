package io.cymantic.boxdrop.moderation

import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository
import java.util.UUID

@JdbcRepository(dialect = Dialect.POSTGRES)
interface ReportRepository : CrudRepository<Report, UUID> {
    fun findByStatus(status: String): List<Report>
    fun findByTargetTypeAndTargetId(targetType: String, targetId: UUID): List<Report>
}
