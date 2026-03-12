package com.cymantic.boxdrop.sales

import io.micronaut.data.annotation.Query
import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository
import java.time.Instant
import java.util.UUID

@JdbcRepository(dialect = Dialect.POSTGRES)
abstract class SaleRepository : CrudRepository<Sale, UUID> {
    abstract fun findBySellerId(sellerId: UUID): List<Sale>
    abstract fun findByStatus(status: String): List<Sale>

    @Query("""
        INSERT INTO sales (id, seller_id, title, description, address, latitude, longitude, location, starts_at, ends_at, status, created_at, updated_at)
        VALUES (:id, :sellerId, :title, :description, :address, :latitude, :longitude,
                ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                :startsAt, :endsAt, :status, :createdAt, :updatedAt)
    """)
    @Suppress("LongParameterList")
    abstract fun insertSale(id: UUID, sellerId: UUID, title: String, description: String?,
                            address: String, latitude: Double, longitude: Double,
                            startsAt: Instant, endsAt: Instant, status: String,
                            createdAt: Instant, updatedAt: Instant)

    @Query("""
        UPDATE sales SET title = :title, description = :description, address = :address,
        latitude = :latitude, longitude = :longitude,
        location = ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
        starts_at = :startsAt, ends_at = :endsAt, status = :status, updated_at = :updatedAt
        WHERE id = :id
    """)
    @Suppress("LongParameterList")
    abstract fun updateSale(id: UUID, title: String, description: String?, address: String,
                            latitude: Double, longitude: Double, startsAt: Instant, endsAt: Instant,
                            status: String, updatedAt: Instant)

    @Query("""
        SELECT s.* FROM sales s
        WHERE s.status = 'ACTIVE'
        AND ST_DWithin(s.location, ST_SetSRID(ST_Point(:lng, :lat), 4326)::geography, :radiusMeters)
        ORDER BY ST_Distance(s.location, ST_SetSRID(ST_Point(:lng, :lat), 4326)::geography)
    """)
    abstract fun findNearby(lat: Double, lng: Double, radiusMeters: Double): List<Sale>

    @Query("""
        SELECT s.* FROM sales s
        WHERE s.status = 'ACTIVE'
        AND s.latitude BETWEEN :south AND :north
        AND s.longitude BETWEEN :west AND :east
    """)
    abstract fun findInBoundingBox(north: Double, south: Double, east: Double, west: Double): List<Sale>
}
