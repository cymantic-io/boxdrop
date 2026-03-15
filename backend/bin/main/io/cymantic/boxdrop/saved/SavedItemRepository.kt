package io.cymantic.boxdrop.saved

import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository
import java.util.Optional
import java.util.UUID

@JdbcRepository(dialect = Dialect.POSTGRES)
interface SavedItemRepository : CrudRepository<SavedItem, UUID> {
    fun findByUserId(userId: UUID): List<SavedItem>
    fun findByUserIdAndListingId(userId: UUID, listingId: UUID): Optional<SavedItem>
    fun deleteByUserIdAndListingId(userId: UUID, listingId: UUID)
    fun existsByUserIdAndListingId(userId: UUID, listingId: UUID): Boolean
}
