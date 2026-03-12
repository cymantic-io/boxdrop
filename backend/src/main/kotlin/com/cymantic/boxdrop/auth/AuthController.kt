package com.cymantic.boxdrop.auth

import com.cymantic.boxdrop.common.dto.*
import com.cymantic.boxdrop.common.extensions.userId
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.Body
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Delete
import io.micronaut.http.annotation.Get
import io.micronaut.http.annotation.PathVariable
import io.micronaut.http.annotation.Post

@Controller("/api/auth")
@Suppress("TooManyFunctions")
class AuthController(private val authService: AuthService) {

    @Post("/register")
    fun register(@Body request: RegisterRequest): HttpResponse<ApiResponse<Map<String, String>>> {
        val challengeId = authService.register(request.email, request.displayName)
        return HttpResponse.created(ApiResponse(mapOf("challengeId" to challengeId)))
    }

    @Post("/register/verify")
    fun verifyRegistration(@Body request: RegisterVerifyRequest): HttpResponse<ApiResponse<AuthResponse>> =
        HttpResponse.ok(ApiResponse(authService.verifyRegistration(request.challengeId, request.code)))

    @Post("/login/start")
    fun loginStart(@Body request: LoginStartRequest): HttpResponse<ApiResponse<LoginStartResponse>> =
        HttpResponse.ok(ApiResponse(authService.loginStart(request.email)))

    @Post("/login/send-code")
    fun loginSendCode(@Body request: LoginSendCodeRequest): HttpResponse<ApiResponse<Map<String, String>>> {
        authService.sendLoginCode(request.challengeId, request.method)
        return HttpResponse.ok(ApiResponse(mapOf("message" to "Code sent")))
    }

    @Post("/login/verify")
    fun loginVerify(@Body request: LoginVerifyRequest): HttpResponse<ApiResponse<AuthResponse>> =
        HttpResponse.ok(ApiResponse(authService.loginVerify(request.challengeId, request.method, request.code)))

    @Post("/refresh")
    fun refresh(@Body request: RefreshRequest): HttpResponse<ApiResponse<AuthResponse>> =
        HttpResponse.ok(ApiResponse(authService.refresh(request.refreshToken)))

    @Get("/methods")
    fun getMethods(request: HttpRequest<*>): HttpResponse<ApiResponse<List<MethodResponse>>> =
        HttpResponse.ok(ApiResponse(authService.getMethods(request.userId())))

    @Post("/methods/totp/setup")
    fun setupTotp(request: HttpRequest<*>): HttpResponse<ApiResponse<TotpSetupResponse>> =
        HttpResponse.ok(ApiResponse(authService.setupTotp(request.userId())))

    @Post("/methods/totp/confirm")
    fun confirmTotp(request: HttpRequest<*>, @Body body: TotpConfirmRequest): HttpResponse<ApiResponse<Map<String, String>>> {
        authService.confirmTotp(request.userId(), body.code)
        return HttpResponse.ok(ApiResponse(mapOf("message" to "Authenticator app enabled")))
    }

    @Post("/methods/sms/setup")
    fun setupSms(request: HttpRequest<*>, @Body body: SmsSetupRequest): HttpResponse<ApiResponse<Map<String, String>>> {
        val challengeId = authService.setupSms(request.userId(), body.phoneNumber)
        return HttpResponse.ok(ApiResponse(mapOf("challengeId" to challengeId)))
    }

    @Post("/methods/sms/confirm")
    fun confirmSms(request: HttpRequest<*>, @Body body: SmsConfirmRequest): HttpResponse<ApiResponse<Map<String, String>>> {
        authService.confirmSms(request.userId(), body.challengeId, body.code)
        return HttpResponse.ok(ApiResponse(mapOf("message" to "SMS verification enabled")))
    }

    @Delete("/methods/{type}")
    fun removeMethod(request: HttpRequest<*>, @PathVariable type: String): HttpResponse<ApiResponse<Map<String, String>>> {
        authService.removeMethod(request.userId(), type)
        return HttpResponse.ok(ApiResponse(mapOf("message" to "Method removed")))
    }
}
