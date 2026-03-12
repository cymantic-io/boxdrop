package com.cymantic.boxdrop.reviews

import com.cymantic.boxdrop.common.dto.ApiResponse
import com.cymantic.boxdrop.common.dto.CreateReviewRequest
import com.cymantic.boxdrop.common.dto.ReviewResponse
import com.cymantic.boxdrop.common.extensions.userId
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
