package com.cymantic.boxdrop.common.dto

import io.micronaut.serde.annotation.Serdeable

@Serdeable
data class RegisterRequest(val email: String, val displayName: String?)

@Serdeable
data class RegisterVerifyRequest(val challengeId: String, val code: String)

@Serdeable
data class LoginStartRequest(val email: String)

@Serdeable
data class LoginStartResponse(val challengeId: String, val methods: List<String>)

@Serdeable
data class LoginSendCodeRequest(val challengeId: String, val method: String)

@Serdeable
data class LoginVerifyRequest(val challengeId: String, val method: String, val code: String)

@Serdeable
data class RefreshRequest(val refreshToken: String)

@Serdeable
data class AuthResponse(val accessToken: String, val refreshToken: String, val userId: String)

@Serdeable
data class TotpConfirmRequest(val code: String)

@Serdeable
data class TotpSetupResponse(val secret: String, val qrUri: String)

@Serdeable
data class SmsSetupRequest(val phoneNumber: String)

@Serdeable
data class SmsConfirmRequest(val challengeId: String, val code: String)

@Serdeable
data class MethodResponse(val type: String, val enabled: Boolean, val hasPhoneNumber: Boolean)
