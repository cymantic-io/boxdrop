package com.boxdrop.saved

import com.boxdrop.common.dto.ApiResponse
import com.boxdrop.common.dto.ListingResponse
import com.boxdrop.common.extensions.userId
import com.boxdrop.listings.ListingService
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.*
import java.time.Instant
import java.util.UUID

@Controller("/api/saved")
class SavedController(
    private val savedItemRepository: SavedItemRepository,
    private val listingService: ListingService
) {
    @Post("/{listingId}")
    fun save(request: HttpRequest<*>, @PathVariable listingId: UUID): HttpResponse<Unit> {
        val userId = request.userId()
        if (!savedItemRepository.existsByUserIdAndListingId(userId, listingId)) {
            savedItemRepository.save(SavedItem(UUID.randomUUID(), userId, listingId, Instant.now()))
        }
        return HttpResponse.created(Unit)
    }

    @Delete("/{listingId}")
    fun unsave(request: HttpRequest<*>, @PathVariable listingId: UUID): HttpResponse<Unit> {
        savedItemRepository.deleteByUserIdAndListingId(request.userId(), listingId)
        return HttpResponse.noContent()
    }

    @Get
    fun getSaved(request: HttpRequest<*>): HttpResponse<ApiResponse<List<ListingResponse>>> {
        val items = savedItemRepository.findByUserId(request.userId())
        val listings = items.mapNotNull { runCatching { listingService.getById(it.listingId) }.getOrNull() }
        return HttpResponse.ok(ApiResponse(listings))
    }
}
