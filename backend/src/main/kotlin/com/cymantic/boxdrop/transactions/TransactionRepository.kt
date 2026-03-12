package com.cymantic.boxdrop.transactions

import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository
import java.util.Optional
import java.util.UUID

@JdbcRepository(dialect = Dialect.POSTGRES)
interface TransactionRepository : CrudRepository<Transaction, UUID> {
    fun findByBuyerId(buyerId: UUID): List<Transaction>
    fun findBySellerId(sellerId: UUID): List<Transaction>
    fun findByListingIdAndStatusIn(listingId: UUID, statuses: List<String>): List<Transaction>
    fun findByPickupToken(pickupToken: String): Optional<Transaction>
}
