package io.cymantic.boxdrop.sales

import io.cymantic.boxdrop.common.dto.*
import io.cymantic.boxdrop.common.extensions.userId
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.*
import java.util.UUID

@Controller("/api/sales")
open class SaleController(private val saleService: SaleService) {

    @Post
    fun create(request: HttpRequest<*>, @Body body: CreateSaleRequest): HttpResponse<ApiResponse<SaleResponse>> =
        HttpResponse.created(ApiResponse(saleService.create(request.userId(), body)))

    @Get
    fun getMySales(request: HttpRequest<*>): HttpResponse<ApiResponse<List<SaleResponse>>> =
        HttpResponse.ok(ApiResponse(saleService.getMySales(request.userId())))

    @Get("/{id:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}")
    fun getById(@PathVariable id: UUID): HttpResponse<ApiResponse<SaleResponse>> =
        HttpResponse.ok(ApiResponse(saleService.getById(id)))

    @Put("/{id:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}")
    fun update(request: HttpRequest<*>, @PathVariable id: UUID, @Body body: UpdateSaleRequest): HttpResponse<ApiResponse<SaleResponse>> =
        HttpResponse.ok(ApiResponse(saleService.update(id, request.userId(), body)))

    @Delete("/{id:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}")
    fun delete(request: HttpRequest<*>, @PathVariable id: UUID): HttpResponse<Unit> {
        saleService.delete(id, request.userId())
        return HttpResponse.noContent()
    }

    @Post("/{id:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}/activate")
    fun activate(request: HttpRequest<*>, @PathVariable id: UUID): HttpResponse<ApiResponse<SaleResponse>> =
        HttpResponse.ok(ApiResponse(saleService.activate(id, request.userId())))

    @Post("/{id:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}/end")
    fun end(request: HttpRequest<*>, @PathVariable id: UUID): HttpResponse<ApiResponse<SaleResponse>> =
        HttpResponse.ok(ApiResponse(saleService.endSale(id, request.userId())))
}
