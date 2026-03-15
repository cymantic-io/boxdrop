package io.cymantic.boxdrop.common.dto

import io.micronaut.serde.annotation.Serdeable
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

@Serdeable
data class RegisterRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String,

    @field:Size(max = 100, message = "Display name must be less than 100 characters")
    val displayName: String?
)

@Serdeable
data class RegisterVerifyRequest(
    @field:NotBlank(message = "Challenge ID is required")
    val challengeId: String,

    @field:NotBlank(message = "Code is required")
    @field:Size(min = 6, max = 6, message = "Code must be 6 digits")
    val code: String
)

@Serdeable
data class LoginStartRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String
)

@Serdeable
data class LoginStartResponse(val challengeId: String, val methods: List<String>)

@Serdeable
data class LoginSendCodeRequest(
    @field:NotBlank(message = "Challenge ID is required")
    val challengeId: String,

    @field:NotBlank(message = "Method is required")
    val method: String
)

@Serdeable
data class LoginVerifyRequest(
    @field:NotBlank(message = "Challenge ID is required")
    val challengeId: String,

    @field:NotBlank(message = "Method is required")
    val method: String,

    @field:NotBlank(message = "Code is required")
    val code: String
)

@Serdeable
data class RefreshRequest(
    @field:NotBlank(message = "Refresh token is required")
    val refreshToken: String
)

@Serdeable
data class AuthResponse(val accessToken: String, val refreshToken: String, val userId: String)

@Serdeable
data class TotpConfirmRequest(
    @field:NotBlank(message = "Code is required")
    @field:Size(min = 6, max = 6, message = "Code must be 6 digits")
    val code: String
)

@Serdeable
data class TotpSetupResponse(val secret: String, val qrUri: String)

@Serdeable
data class SmsSetupRequest(
    @field:NotBlank(message = "Phone number is required")
    @field:Pattern(regexp = "^\\+?[1-9]\\d{6,14}$", message = "Invalid phone number format")
    val phoneNumber: String
)

@Serdeable
data class SmsConfirmRequest(
    @field:NotBlank(message = "Challenge ID is required")
    val challengeId: String,

    @field:NotBlank(message = "Code is required")
    @field:Size(min = 6, max = 6, message = "Code must be 6 digits")
    val code: String
)

@Serdeable
data class MethodResponse(val type: String, val enabled: Boolean, val hasPhoneNumber: Boolean)
