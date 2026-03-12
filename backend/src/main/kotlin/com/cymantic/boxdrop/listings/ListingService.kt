package com.cymantic.boxdrop.listings

import com.cymantic.boxdrop.common.dto.*
import com.cymantic.boxdrop.common.exceptions.BadRequestException
import com.cymantic.boxdrop.common.exceptions.NotFoundException
import com.cymantic.boxdrop.common.exceptions.UnauthorizedException
import com.cymantic.boxdrop.sales.SaleRepository
import jakarta.inject.Singleton
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

@Singleton
class ListingService(
    private val listingRepository: ListingRepository,
    private val listingImageRepository: ListingImageRepository,
    private val saleRepository: SaleRepository
) {
    fun create(saleId: UUID, sellerId: UUID, request: CreateListingRequest): ListingResponse {
        val sale = saleRepository.findById(saleId).orElseThrow { NotFoundException("Sale not found") }
        if (sale.sellerId != sellerId) throw UnauthorizedException("Not your sale")
        val minimumPrice = request.minimumPrice ?: BigDecimal.ZERO
        val listing = listingRepository.save(Listing(
            id = UUID.randomUUID(), saleId = saleId, title = request.title,
            description = request.description, startingPrice = request.startingPrice,
            minimumPrice = minimumPrice, currentPrice = request.startingPrice,
            category = request.category, condition = request.condition,
            status = "AVAILABLE", createdAt = Instant.now(), updatedAt = Instant.now()
        ))
        request.imageUrls?.forEachIndexed { index, url ->
            listingImageRepository.save(ListingImage(
                id = UUID.randomUUID(), listingId = listing.id, imageUrl = url,
                sortOrder = index, createdAt = Instant.now()
            ))
        }
        return toResponse(listing)
    }

    fun getBySaleId(saleId: UUID): List<ListingResponse> =
        listingRepository.findBySaleId(saleId).map { toResponse(it) }

    fun getById(id: UUID): ListingResponse {
        val listing = listingRepository.findById(id).orElseThrow { NotFoundException("Listing not found") }
        return toResponse(listing)
    }

    fun update(id: UUID, sellerId: UUID, request: UpdateListingRequest): ListingResponse {
        val listing = listingRepository.findById(id).orElseThrow { NotFoundException("Listing not found") }
        val sale = saleRepository.findById(listing.saleId).orElseThrow { NotFoundException("Sale not found") }
        if (sale.sellerId != sellerId) throw UnauthorizedException("Not your listing")
        val updated = listing.copy(
            title = request.title ?: listing.title, description = request.description ?: listing.description,
            startingPrice = request.startingPrice ?: listing.startingPrice,
            minimumPrice = request.minimumPrice ?: listing.minimumPrice,
            currentPrice = request.startingPrice ?: listing.currentPrice,
            category = request.category ?: listing.category,
            condition = request.condition ?: listing.condition, updatedAt = Instant.now()
        )
        listingRepository.update(updated)
        return toResponse(updated)
    }

    fun updateStatus(id: UUID, sellerId: UUID, newStatus: String): ListingResponse {
        val listing = listingRepository.findById(id).orElseThrow { NotFoundException("Listing not found") }
        val sale = saleRepository.findById(listing.saleId).orElseThrow { NotFoundException("Sale not found") }
        if (sale.sellerId != sellerId) throw UnauthorizedException("Not your listing")
        val validStatuses = listOf("AVAILABLE", "SOLD", "REMOVED")
        if (newStatus !in validStatuses) throw BadRequestException("Invalid status: $newStatus")
        val updated = listing.copy(status = newStatus, updatedAt = Instant.now())
        listingRepository.update(updated)
        return toResponse(updated)
    }

    fun delete(id: UUID, sellerId: UUID) {
        val listing = listingRepository.findById(id).orElseThrow { NotFoundException("Listing not found") }
        val sale = saleRepository.findById(listing.saleId).orElseThrow { NotFoundException("Sale not found") }
        if (sale.sellerId != sellerId) throw UnauthorizedException("Not your listing")
        listingRepository.delete(listing)
    }

    fun search(query: String, page: Int, size: Int): PaginatedResponse<ListingResponse> {
        val offset = page * size
        val results = listingRepository.search(query, size, offset).map { toResponse(it) }
        val total = listingRepository.searchCount(query)
        return PaginatedResponse(data = results, page = page, size = size,
            totalElements = total, totalPages = ((total + size - 1) / size).toInt())
    }

    fun findNearby(lat: Double, lng: Double, radiusKm: Double, page: Int, size: Int): PaginatedResponse<ListingResponse> {
        val results = listingRepository.findNearby(lat, lng, radiusKm * 1000, size, page * size).map { toResponse(it) }
        return PaginatedResponse(data = results, page = page, size = size,
            totalElements = results.size.toLong(), totalPages = 1)
    }

    fun toResponse(listing: Listing): ListingResponse {
        val images = listingImageRepository.findByListingIdOrderBySortOrder(listing.id)
        return ListingResponse(
            id = listing.id.toString(), saleId = listing.saleId.toString(), title = listing.title,
            description = listing.description, startingPrice = listing.startingPrice,
            minimumPrice = listing.minimumPrice, currentPrice = listing.currentPrice,
            category = listing.category, condition = listing.condition, status = listing.status,
            images = images.map { ListingImageResponse(it.id.toString(), it.imageUrl, it.sortOrder) },
            createdAt = listing.createdAt
        )
    }
}
