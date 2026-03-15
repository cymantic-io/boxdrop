package io.cymantic.boxdrop.messaging

import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository
import java.util.Optional
import java.util.UUID

@JdbcRepository(dialect = Dialect.POSTGRES)
interface MessageThreadRepository : CrudRepository<MessageThread, UUID> {
    fun findByBuyerIdAndListingId(buyerId: UUID, listingId: UUID): Optional<MessageThread>
    fun findByBuyerIdOrSellerId(buyerId: UUID, sellerId: UUID): List<MessageThread>
}
