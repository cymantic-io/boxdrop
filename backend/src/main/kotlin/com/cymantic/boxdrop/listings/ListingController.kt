package com.cymantic.boxdrop.listings

import com.cymantic.boxdrop.common.dto.*
import com.cymantic.boxdrop.common.extensions.userId
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.*
import java.util.UUID

@Controller("/api")
class ListingController(private val listingService: ListingService) {

    @Post("/sales/{saleId}/listings")
    fun create(request: HttpRequest<*>, @PathVariable saleId: UUID, @Body body: CreateListingRequest): HttpResponse<ApiResponse<ListingResponse>> =
        HttpResponse.created(ApiResponse(listingService.create(saleId, request.userId(), body)))

    @Get("/sales/{saleId}/listings")
    fun getBySaleId(@PathVariable saleId: UUID): HttpResponse<ApiResponse<List<ListingResponse>>> =
        HttpResponse.ok(ApiResponse(listingService.getBySaleId(saleId)))

    @Get("/listings/{id}")
    fun getById(@PathVariable id: UUID): HttpResponse<ApiResponse<ListingResponse>> =
        HttpResponse.ok(ApiResponse(listingService.getById(id)))

    @Put("/listings/{id}")
    fun update(request: HttpRequest<*>, @PathVariable id: UUID, @Body body: UpdateListingRequest): HttpResponse<ApiResponse<ListingResponse>> =
        HttpResponse.ok(ApiResponse(listingService.update(id, request.userId(), body)))

    @Put("/listings/{id}/status")
    fun updateStatus(
        request: HttpRequest<*>,
        @PathVariable id: UUID,
        @Body body: UpdateListingStatusRequest
    ): HttpResponse<ApiResponse<ListingResponse>> =
        HttpResponse.ok(ApiResponse(listingService.updateStatus(id, request.userId(), body.status)))

    @Delete("/listings/{id}")
    fun delete(request: HttpRequest<*>, @PathVariable id: UUID): HttpResponse<Unit> {
        listingService.delete(id, request.userId())
        return HttpResponse.noContent()
    }
}
