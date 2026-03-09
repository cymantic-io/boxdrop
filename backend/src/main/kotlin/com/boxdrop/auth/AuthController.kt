package com.boxdrop.auth

import com.boxdrop.common.dto.*
import com.boxdrop.common.extensions.userId
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.Body
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Post

@Controller("/api/auth")
class AuthController(private val authService: AuthService) {

    @Post("/register")
    fun register(@Body request: RegisterRequest): HttpResponse<ApiResponse<AuthResponse>> =
        HttpResponse.created(ApiResponse(authService.register(request)))

    @Post("/login")
    fun login(@Body request: LoginRequest): HttpResponse<ApiResponse<AuthResponse>> =
        HttpResponse.ok(ApiResponse(authService.login(request)))

    @Post("/change-password")
    fun changePassword(request: HttpRequest<*>, @Body body: ChangePasswordRequest): HttpResponse<ApiResponse<Map<String, String>>> {
        authService.changePassword(request.userId(), body)
        return HttpResponse.ok(ApiResponse(mapOf("message" to "Password changed successfully")))
    }

    @Post("/refresh")
    fun refresh(@Body request: RefreshRequest): HttpResponse<ApiResponse<AuthResponse>> =
        HttpResponse.ok(ApiResponse(authService.refresh(request.refreshToken)))
}
