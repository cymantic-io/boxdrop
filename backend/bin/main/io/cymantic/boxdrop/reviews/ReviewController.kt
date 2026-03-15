package io.cymantic.boxdrop.reviews

import io.cymantic.boxdrop.common.dto.ApiResponse
import io.cymantic.boxdrop.common.dto.CreateReviewRequest
import io.cymantic.boxdrop.common.dto.ReviewResponse
import io.cymantic.boxdrop.common.extensions.userId
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.*
import java.util.UUID

@Controller("/api")
class ReviewController(private val reviewService: ReviewService) {

    @Post("/reviews")
    fun create(request: HttpRequest<*>, @Body body: CreateReviewRequest): HttpResponse<ApiResponse<ReviewResponse>> =
        HttpResponse.created(ApiResponse(reviewService.create(request.userId(), body)))

    @Get("/users/{id}/reviews")
    fun getForSeller(@PathVariable id: UUID): HttpResponse<ApiResponse<List<ReviewResponse>>> =
        HttpResponse.ok(ApiResponse(reviewService.getForSeller(id)))
}
