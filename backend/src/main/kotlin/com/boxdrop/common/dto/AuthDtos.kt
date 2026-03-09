package com.boxdrop.common.dto

import io.micronaut.serde.annotation.Serdeable

@Serdeable
data class RegisterRequest(val email: String, val password: String, val displayName: String?)

@Serdeable
data class LoginRequest(val email: String, val password: String)

@Serdeable
data class RefreshRequest(val refreshToken: String)

@Serdeable
data class AuthResponse(val accessToken: String, val refreshToken: String, val userId: String)
