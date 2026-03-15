package io.cymantic.boxdrop.search

import io.cymantic.boxdrop.common.dto.ListingResponse
import io.cymantic.boxdrop.common.dto.PaginatedResponse
import io.cymantic.boxdrop.listings.ListingService
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Get
import io.micronaut.http.annotation.QueryValue

@Controller("/api/search")
class SearchController(private val listingService: ListingService) {

    @Get
    fun search(
        @QueryValue(defaultValue = "") q: String,
        @QueryValue(defaultValue = "0") page: Int,
        @QueryValue(defaultValue = "20") size: Int
    ): HttpResponse<PaginatedResponse<ListingResponse>> =
        HttpResponse.ok(listingService.search(q, page, size))
}
