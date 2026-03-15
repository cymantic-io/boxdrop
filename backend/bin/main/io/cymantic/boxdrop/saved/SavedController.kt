package io.cymantic.boxdrop.saved

import io.cymantic.boxdrop.common.dto.ApiResponse
import io.cymantic.boxdrop.common.dto.ListingResponse
import io.cymantic.boxdrop.common.extensions.userId
import io.cymantic.boxdrop.listings.ListingService
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
    fun save(request: HttpRequest<*>, @PathVariable listingId: UUID): HttpResponse<*> {
        val userId = request.userId()
        if (!savedItemRepository.existsByUserIdAndListingId(userId, listingId)) {
            savedItemRepository.save(SavedItem(UUID.randomUUID(), userId, listingId, Instant.now()))
        }
        return HttpResponse.ok<Any>(null)
    }

    @Delete("/{listingId}")
    fun unsave(request: HttpRequest<*>, @PathVariable listingId: UUID): HttpResponse<*> {
        savedItemRepository.deleteByUserIdAndListingId(request.userId(), listingId)
        return HttpResponse.noContent<Any>()
    }

    @Get
    fun getSaved(request: HttpRequest<*>): HttpResponse<ApiResponse<List<ListingResponse>>> {
        val items = savedItemRepository.findByUserId(request.userId())
        val listings = items.mapNotNull { runCatching { listingService.getById(it.listingId) }.getOrNull() }
        return HttpResponse.ok(ApiResponse(listings))
    }
}
