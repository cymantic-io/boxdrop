package com.cymantic.boxdrop.search

import com.cymantic.boxdrop.common.dto.*
import com.cymantic.boxdrop.listings.ListingService
import com.cymantic.boxdrop.sales.SaleService
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Get
import io.micronaut.http.annotation.QueryValue

@Controller("/api/map")
class MapController(private val saleService: SaleService, private val listingService: ListingService) {

    @Get("/sales")
    fun getSalesNearby(
        @QueryValue lat: Double, @QueryValue lng: Double,
        @QueryValue(defaultValue = "10") radiusKm: Double
    ): HttpResponse<ApiResponse<List<SaleResponse>>> =
        HttpResponse.ok(ApiResponse(saleService.findNearby(lat, lng, radiusKm)))

    @Get("/listings")
    fun getListingsNearby(
        @QueryValue lat: Double, @QueryValue lng: Double,
        @QueryValue(defaultValue = "10") radiusKm: Double,
        @QueryValue(defaultValue = "0") page: Int,
        @QueryValue(defaultValue = "50") size: Int
    ): HttpResponse<PaginatedResponse<ListingResponse>> =
        HttpResponse.ok(listingService.findNearby(lat, lng, radiusKm, page, size))
}
