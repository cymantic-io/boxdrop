package com.boxdrop.sales

import io.micronaut.data.annotation.Query
import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository
import java.util.UUID

@JdbcRepository(dialect = Dialect.POSTGRES)
interface SaleRepository : CrudRepository<Sale, UUID> {
    fun findBySellerId(sellerId: UUID): List<Sale>
    fun findByStatus(status: String): List<Sale>

    @Query("""
        SELECT s.* FROM sales s
        WHERE s.status = 'ACTIVE'
        AND ST_DWithin(s.location, ST_SetSRID(ST_Point(:lng, :lat), 4326)::geography, :radiusMeters)
        ORDER BY ST_Distance(s.location, ST_SetSRID(ST_Point(:lng, :lat), 4326)::geography)
    """)
    fun findNearby(lat: Double, lng: Double, radiusMeters: Double): List<Sale>

    @Query("""
        SELECT s.* FROM sales s
        WHERE s.status = 'ACTIVE'
        AND s.latitude BETWEEN :south AND :north
        AND s.longitude BETWEEN :west AND :east
    """)
    fun findInBoundingBox(north: Double, south: Double, east: Double, west: Double): List<Sale>
}
