package io.cymantic.boxdrop.sales

import io.cymantic.boxdrop.common.dto.*
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Get
import io.micronaut.http.annotation.QueryValue

@Controller("/api/explore")
class NearbySalesController(private val saleService: SaleService) {

    @Get
    fun findNearby(
        @QueryValue lat: Double, @QueryValue lng: Double,
        @QueryValue(defaultValue = "10") radiusKm: Double
    ): HttpResponse<ApiResponse<List<SaleResponse>>> =
        HttpResponse.ok(ApiResponse(saleService.findNearby(lat, lng, radiusKm)))
}
