package io.cymantic.boxdrop.sales

import io.cymantic.boxdrop.common.dto.*
import io.cymantic.boxdrop.common.exceptions.BadRequestException
import io.cymantic.boxdrop.common.exceptions.NotFoundException
import io.cymantic.boxdrop.common.exceptions.UnauthorizedException
import io.cymantic.boxdrop.listings.ListingRepository
import jakarta.inject.Singleton
import java.time.Instant
import java.util.UUID

@Singleton
class SaleService(
    private val saleRepository: SaleRepository,
    private val listingRepository: ListingRepository
) {
    fun create(sellerId: UUID, request: CreateSaleRequest): SaleResponse {
        val now = Instant.now()
        val sale = Sale(
            id = UUID.randomUUID(), sellerId = sellerId, title = request.title,
            description = request.description, address = request.address,
            latitude = request.latitude, longitude = request.longitude,
            startsAt = request.startsAt, endsAt = request.endsAt,
            status = "DRAFT", createdAt = now, updatedAt = now
        )
        saleRepository.insertSale(
            sale.id, sale.sellerId, sale.title, sale.description, sale.address,
            sale.latitude, sale.longitude, sale.startsAt, sale.endsAt,
            sale.status, sale.createdAt, sale.updatedAt
        )
        return toResponse(sale, 0)
    }

    fun getMySales(sellerId: UUID): List<SaleResponse> =
        saleRepository.findBySellerId(sellerId).map { toResponse(it) }

    fun getById(id: UUID): SaleResponse {
        val sale = saleRepository.findById(id).orElseThrow { NotFoundException("Sale not found") }
        return toResponse(sale)
    }

    fun update(saleId: UUID, sellerId: UUID, request: UpdateSaleRequest): SaleResponse {
        val sale = saleRepository.findById(saleId).orElseThrow { NotFoundException("Sale not found") }
        if (sale.sellerId != sellerId) throw UnauthorizedException("Not your sale")
        val updated = sale.copy(
            title = request.title ?: sale.title, description = request.description ?: sale.description,
            address = request.address ?: sale.address, latitude = request.latitude ?: sale.latitude,
            longitude = request.longitude ?: sale.longitude, startsAt = request.startsAt ?: sale.startsAt,
            endsAt = request.endsAt ?: sale.endsAt, updatedAt = Instant.now()
        )
        saleRepository.updateSale(
            updated.id, updated.title, updated.description, updated.address,
            updated.latitude, updated.longitude, updated.startsAt, updated.endsAt,
            updated.status, updated.updatedAt
        )
        return toResponse(updated)
    }

    fun activate(saleId: UUID, sellerId: UUID): SaleResponse {
        val sale = saleRepository.findById(saleId).orElseThrow { NotFoundException("Sale not found") }
        if (sale.sellerId != sellerId) throw UnauthorizedException("Not your sale")
        if (sale.status != "DRAFT") throw BadRequestException("Sale is not in DRAFT status")
        val activated = sale.copy(status = "ACTIVE", updatedAt = Instant.now())
        saleRepository.updateSale(
            activated.id, activated.title, activated.description, activated.address,
            activated.latitude, activated.longitude, activated.startsAt, activated.endsAt,
            activated.status, activated.updatedAt
        )
        return toResponse(activated)
    }

    fun endSale(saleId: UUID, sellerId: UUID): SaleResponse {
        val sale = saleRepository.findById(saleId).orElseThrow { NotFoundException("Sale not found") }
        if (sale.sellerId != sellerId) throw UnauthorizedException("Not your sale")
        if (sale.status != "ACTIVE") throw BadRequestException("Sale is not active")
        val ended = sale.copy(status = "ENDED", updatedAt = Instant.now())
        saleRepository.updateSale(
            ended.id, ended.title, ended.description, ended.address,
            ended.latitude, ended.longitude, ended.startsAt, ended.endsAt,
            ended.status, ended.updatedAt
        )
        return toResponse(ended)
    }

    fun delete(saleId: UUID, sellerId: UUID) {
        val sale = saleRepository.findById(saleId).orElseThrow { NotFoundException("Sale not found") }
        if (sale.sellerId != sellerId) throw UnauthorizedException("Not your sale")
        saleRepository.delete(sale)
    }

    fun findNearby(lat: Double, lng: Double, radiusKm: Double): List<SaleResponse> =
        saleRepository.findNearby(lat, lng, radiusKm * 1000).map { toResponse(it) }

    private fun toResponse(sale: Sale, listingCount: Int? = null): SaleResponse {
        val count = listingCount ?: listingRepository.findBySaleId(sale.id).size
        val jitterLat = sale.latitude + (Math.random() - 0.5) * 0.001
        val jitterLng = sale.longitude + (Math.random() - 0.5) * 0.001
        return SaleResponse(
            id = sale.id.toString(), sellerId = sale.sellerId.toString(), title = sale.title,
            description = sale.description, address = null, latitude = jitterLat, longitude = jitterLng,
            startsAt = sale.startsAt, endsAt = sale.endsAt, status = sale.status,
            listingCount = count, createdAt = sale.createdAt
        )
    }
}
