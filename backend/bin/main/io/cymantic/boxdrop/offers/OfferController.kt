package io.cymantic.boxdrop.offers

import io.cymantic.boxdrop.common.dto.*
import io.cymantic.boxdrop.common.extensions.userId
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.*
import java.util.UUID

@Controller("/api/offers")
class OfferController(private val offerService: OfferService) {

    @Post
    fun createOffer(request: HttpRequest<*>, @Body body: CreateOfferRequest): HttpResponse<ApiResponse<CreateOfferResponse>> =
        HttpResponse.created(ApiResponse(offerService.createOffer(request.userId(), body)))

    @Post("/{id}/accept")
    fun accept(request: HttpRequest<*>, @PathVariable id: UUID): HttpResponse<ApiResponse<OfferResponse>> =
        HttpResponse.ok(ApiResponse(offerService.acceptOffer(id, request.userId())))

    @Post("/{id}/reject")
    fun reject(request: HttpRequest<*>, @PathVariable id: UUID): HttpResponse<ApiResponse<OfferResponse>> =
        HttpResponse.ok(ApiResponse(offerService.rejectOffer(id, request.userId())))

    @Post("/{id}/counter")
    fun counter(request: HttpRequest<*>, @PathVariable id: UUID, @Body body: CounterOfferRequest): HttpResponse<ApiResponse<CreateOfferResponse>> =
        HttpResponse.ok(ApiResponse(offerService.counterOffer(id, request.userId(), body)))
}
