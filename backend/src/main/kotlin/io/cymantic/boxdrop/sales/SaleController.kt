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

    @Get("/{id}")
    fun getById(@PathVariable id: String): HttpResponse<ApiResponse<SaleResponse>> {
        val uuid = UUID.fromString(id)
        return HttpResponse.ok(ApiResponse(saleService.getById(uuid)))
    }

    @Put("/{id}")
    fun update(request: HttpRequest<*>, @PathVariable id: String, @Body body: UpdateSaleRequest): HttpResponse<ApiResponse<SaleResponse>> {
        val uuid = UUID.fromString(id)
        return HttpResponse.ok(ApiResponse(saleService.update(uuid, request.userId(), body)))
    }

    @Delete("/{id}")
    fun delete(request: HttpRequest<*>, @PathVariable id: String): HttpResponse<Unit> {
        val uuid = UUID.fromString(id)
        saleService.delete(uuid, request.userId())
        return HttpResponse.noContent()
    }

    @Post("/{id}/activate")
    fun activate(request: HttpRequest<*>, @PathVariable id: String): HttpResponse<ApiResponse<SaleResponse>> {
        val uuid = UUID.fromString(id)
        return HttpResponse.ok(ApiResponse(saleService.activate(uuid, request.userId())))
    }

    @Post("/{id}/end")
    fun end(request: HttpRequest<*>, @PathVariable id: String): HttpResponse<ApiResponse<SaleResponse>> {
        val uuid = UUID.fromString(id)
        return HttpResponse.ok(ApiResponse(saleService.endSale(uuid, request.userId())))
    }
}
