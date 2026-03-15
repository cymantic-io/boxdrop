package io.cymantic.boxdrop.users

import io.cymantic.boxdrop.common.dto.*
import io.cymantic.boxdrop.common.extensions.userId
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.*
import java.util.UUID

@Controller("/api/users")
open class UserController(private val userService: UserService) {

    @Get("/me")
    fun getMyProfile(request: HttpRequest<*>): HttpResponse<ApiResponse<UserProfileResponse>> =
        HttpResponse.ok(ApiResponse(userService.getProfile(request.userId())))

    @Put("/me")
    fun updateProfile(request: HttpRequest<*>, @Body body: UpdateProfileRequest): HttpResponse<ApiResponse<UserProfileResponse>> =
        HttpResponse.ok(ApiResponse(userService.updateProfile(request.userId(), body)))

    @Get("/{id}")
    fun getPublicProfile(@PathVariable id: UUID): HttpResponse<ApiResponse<UserProfileResponse>> =
        HttpResponse.ok(ApiResponse(userService.getPublicProfile(id)))
}
