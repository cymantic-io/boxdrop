package com.cymantic.boxdrop.offers

import io.micronaut.data.annotation.Query
import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository
import java.util.UUID

@JdbcRepository(dialect = Dialect.POSTGRES)
interface OfferRepository : CrudRepository<Offer, UUID> {
    fun findByThreadIdOrderByCreatedAt(threadId: UUID): List<Offer>
    fun findByListingIdAndStatus(listingId: UUID, status: String): List<Offer>
    fun findByMessageId(messageId: UUID): Offer?

    @Query("UPDATE offers SET status = :status, updated_at = now() WHERE listing_id = :listingId AND status = 'PENDING' AND id != :excludeId")
    fun rejectOtherPending(listingId: UUID, excludeId: UUID, status: String)
}
