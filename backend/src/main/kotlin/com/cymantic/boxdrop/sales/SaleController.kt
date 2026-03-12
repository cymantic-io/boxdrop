package com.cymantic.boxdrop.sales

import com.cymantic.boxdrop.common.dto.*
import com.cymantic.boxdrop.common.extensions.userId
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.*
import java.util.UUID

@Controller("/api/sales")
class SaleController(private val saleService: SaleService) {

    @Post
    fun create(request: HttpRequest<*>, @Body body: CreateSaleRequest): HttpResponse<ApiResponse<SaleResponse>> =
        HttpResponse.created(ApiResponse(saleService.create(request.userId(), body)))

    @Get
    fun getMySales(request: HttpRequest<*>): HttpResponse<ApiResponse<List<SaleResponse>>> =
        HttpResponse.ok(ApiResponse(saleService.getMySales(request.userId())))

    @Get("/{id}")
    fun getById(@PathVariable id: UUID): HttpResponse<ApiResponse<SaleResponse>> =
        HttpResponse.ok(ApiResponse(saleService.getById(id)))

    @Put("/{id}")
    fun update(request: HttpRequest<*>, @PathVariable id: UUID, @Body body: UpdateSaleRequest): HttpResponse<ApiResponse<SaleResponse>> =
        HttpResponse.ok(ApiResponse(saleService.update(id, request.userId(), body)))

    @Delete("/{id}")
    fun delete(request: HttpRequest<*>, @PathVariable id: UUID): HttpResponse<Unit> {
        saleService.delete(id, request.userId())
        return HttpResponse.noContent()
    }

    @Post("/{id}/activate")
    fun activate(request: HttpRequest<*>, @PathVariable id: UUID): HttpResponse<ApiResponse<SaleResponse>> =
        HttpResponse.ok(ApiResponse(saleService.activate(id, request.userId())))

    @Post("/{id}/end")
    fun end(request: HttpRequest<*>, @PathVariable id: UUID): HttpResponse<ApiResponse<SaleResponse>> =
        HttpResponse.ok(ApiResponse(saleService.endSale(id, request.userId())))

    @Get("/nearby")
    fun findNearby(
        @QueryValue lat: Double, @QueryValue lng: Double,
        @QueryValue(defaultValue = "10") radiusKm: Double
    ): HttpResponse<ApiResponse<List<SaleResponse>>> =
        HttpResponse.ok(ApiResponse(saleService.findNearby(lat, lng, radiusKm)))
}
