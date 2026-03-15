package io.cymantic.boxdrop.listings

import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository
import java.util.UUID

@JdbcRepository(dialect = Dialect.POSTGRES)
interface ListingImageRepository : CrudRepository<ListingImage, UUID> {
    fun findByListingIdOrderBySortOrder(listingId: UUID): List<ListingImage>
    fun deleteByListingId(listingId: UUID)
}
