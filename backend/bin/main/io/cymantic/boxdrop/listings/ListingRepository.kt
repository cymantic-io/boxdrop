package io.cymantic.boxdrop.listings

import io.micronaut.data.annotation.Query
import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.Page
import io.micronaut.data.model.Pageable
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository
import java.math.BigDecimal
import java.util.UUID

@JdbcRepository(dialect = Dialect.POSTGRES)
interface ListingRepository : CrudRepository<Listing, UUID> {
    fun findBySaleId(saleId: UUID): List<Listing>
    fun findBySaleIdAndStatus(saleId: UUID, status: String): List<Listing>
    fun findByStatus(status: String, pageable: Pageable): Page<Listing>
    fun findByCategory(category: String, pageable: Pageable): Page<Listing>

    @Query("""
        SELECT l.* FROM listings l
        WHERE l.status = 'AVAILABLE'
        AND l.search_vector @@ plainto_tsquery('english', :query)
        ORDER BY ts_rank(l.search_vector, plainto_tsquery('english', :query)) DESC
        LIMIT :limit OFFSET :offset
    """)
    fun search(query: String, limit: Int, offset: Int): List<Listing>

    @Query("SELECT COUNT(*) FROM listings l WHERE l.status = 'AVAILABLE' AND l.search_vector @@ plainto_tsquery('english', :query)")
    fun searchCount(query: String): Long

    @Query("""
        SELECT l.* FROM listings l
        JOIN sales s ON l.sale_id = s.id
        WHERE l.status = 'AVAILABLE' AND s.status = 'ACTIVE'
        AND ST_DWithin(s.location, ST_SetSRID(ST_Point(:lng, :lat), 4326)::geography, :radiusMeters)
        ORDER BY l.current_price ASC
        LIMIT :limit OFFSET :offset
    """)
    fun findNearby(lat: Double, lng: Double, radiusMeters: Double, limit: Int, offset: Int): List<Listing>

    @Query("UPDATE listings SET current_price = :price, updated_at = now() WHERE id = :id")
    fun updatePrice(id: UUID, price: BigDecimal)

    @Query("UPDATE listings SET status = :status, updated_at = now() WHERE id = :id")
    fun updateStatus(id: UUID, status: String)
}
