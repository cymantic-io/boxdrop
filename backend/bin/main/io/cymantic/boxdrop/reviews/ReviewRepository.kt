package io.cymantic.boxdrop.reviews

import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository
import java.util.Optional
import java.util.UUID

@JdbcRepository(dialect = Dialect.POSTGRES)
interface ReviewRepository : CrudRepository<Review, UUID> {
    fun findBySellerId(sellerId: UUID): List<Review>
    fun findByTransactionId(transactionId: UUID): Optional<Review>
    fun existsByTransactionId(transactionId: UUID): Boolean
}
