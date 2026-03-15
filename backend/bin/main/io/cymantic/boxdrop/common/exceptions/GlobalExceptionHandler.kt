package io.cymantic.boxdrop.common.exceptions

import io.cymantic.boxdrop.common.dto.ErrorResponse
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.HttpStatus
import io.micronaut.http.annotation.Produces
import io.micronaut.http.server.exceptions.ExceptionHandler
import jakarta.inject.Singleton

@Produces
@Singleton
class NotFoundExceptionHandler : ExceptionHandler<NotFoundException, HttpResponse<ErrorResponse>> {
    override fun handle(request: HttpRequest<*>, exception: NotFoundException): HttpResponse<ErrorResponse> =
        HttpResponse.notFound(ErrorResponse("NOT_FOUND", exception.message ?: "Not found", 404))
}

@Produces
@Singleton
class BadRequestExceptionHandler : ExceptionHandler<BadRequestException, HttpResponse<ErrorResponse>> {
    override fun handle(request: HttpRequest<*>, exception: BadRequestException): HttpResponse<ErrorResponse> =
        HttpResponse.badRequest(ErrorResponse("BAD_REQUEST", exception.message ?: "Bad request", 400))
}

@Produces
@Singleton
class UnauthorizedExceptionHandler : ExceptionHandler<UnauthorizedException, HttpResponse<ErrorResponse>> {
    override fun handle(request: HttpRequest<*>, exception: UnauthorizedException): HttpResponse<ErrorResponse> =
        HttpResponse.status<ErrorResponse>(HttpStatus.UNAUTHORIZED)
            .body(ErrorResponse("UNAUTHORIZED", exception.message ?: "Unauthorized", 401))
}

@Produces
@Singleton
class IllegalArgumentHandler : ExceptionHandler<IllegalArgumentException, HttpResponse<ErrorResponse>> {
    override fun handle(request: HttpRequest<*>, exception: IllegalArgumentException): HttpResponse<ErrorResponse> =
        HttpResponse.badRequest(ErrorResponse("BAD_REQUEST", exception.message ?: "Bad request", 400))
}
