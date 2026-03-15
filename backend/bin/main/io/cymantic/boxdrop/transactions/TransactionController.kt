package io.cymantic.boxdrop.transactions

import io.cymantic.boxdrop.common.dto.*
import io.cymantic.boxdrop.common.extensions.userId
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.*
import java.util.UUID

@Controller("/api/transactions")
class TransactionController(private val transactionService: TransactionService) {

    @Post("/claim")
    fun claim(request: HttpRequest<*>, @Body body: ClaimRequest): HttpResponse<ApiResponse<TransactionResponse>> =
        HttpResponse.created(ApiResponse(transactionService.claim(request.userId(), body)))

    @Post("/{id}/confirm-payment")
    fun confirmPayment(request: HttpRequest<*>, @PathVariable id: UUID): HttpResponse<ApiResponse<TransactionResponse>> =
        HttpResponse.ok(ApiResponse(transactionService.confirmPayment(id, request.userId())))

    @Post("/{id}/confirm-pickup")
    fun confirmPickup(
        request: HttpRequest<*>,
        @PathVariable id: UUID,
        @Body body: ConfirmPickupRequest
    ): HttpResponse<ApiResponse<TransactionResponse>> =
        HttpResponse.ok(ApiResponse(transactionService.confirmPickup(id, request.userId(), body)))

    @Post("/{id}/cancel")
    fun cancel(request: HttpRequest<*>, @PathVariable id: UUID): HttpResponse<ApiResponse<TransactionResponse>> =
        HttpResponse.ok(ApiResponse(transactionService.cancel(id, request.userId())))

    @Get
    fun getMyTransactions(request: HttpRequest<*>): HttpResponse<ApiResponse<List<TransactionResponse>>> =
        HttpResponse.ok(ApiResponse(transactionService.getByUser(request.userId())))

    @Get("/{id}")
    fun getById(request: HttpRequest<*>, @PathVariable id: UUID): HttpResponse<ApiResponse<TransactionResponse>> =
        HttpResponse.ok(ApiResponse(transactionService.getById(id, request.userId())))
}
