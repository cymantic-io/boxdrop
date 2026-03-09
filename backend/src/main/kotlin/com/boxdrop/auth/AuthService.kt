package com.boxdrop.auth

import com.boxdrop.common.dto.AuthResponse
import com.boxdrop.common.dto.LoginRequest
import com.boxdrop.common.dto.ChangePasswordRequest
import com.boxdrop.common.dto.RegisterRequest
import com.boxdrop.trust.TrustService
import com.boxdrop.users.User
import com.boxdrop.users.UserRepository
import jakarta.inject.Singleton
import java.time.Instant
import java.util.UUID

@Singleton
class AuthService(
    private val userRepository: UserRepository,
    private val passwordService: PasswordService,
    private val jwtService: JwtService,
    private val trustService: TrustService
) {
    fun register(request: RegisterRequest): AuthResponse {
        if (userRepository.existsByEmail(request.email)) {
            throw IllegalArgumentException("Email already registered")
        }
        val user = userRepository.save(User(
            id = UUID.randomUUID(),
            email = request.email,
            passwordHash = passwordService.hash(request.password),
            displayName = request.displayName,
            avatarUrl = null,
            address = null,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        ))
        trustService.initializeScore(user.id)
        return AuthResponse(
            accessToken = jwtService.generateAccessToken(user.id),
            refreshToken = jwtService.generateRefreshToken(user.id),
            userId = user.id.toString()
        )
    }

    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            .orElseThrow { IllegalArgumentException("Invalid credentials") }
        if (!passwordService.verify(request.password, user.passwordHash)) {
            throw IllegalArgumentException("Invalid credentials")
        }
        return AuthResponse(
            accessToken = jwtService.generateAccessToken(user.id),
            refreshToken = jwtService.generateRefreshToken(user.id),
            userId = user.id.toString()
        )
    }

    fun changePassword(userId: UUID, request: ChangePasswordRequest) {
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
        if (!passwordService.verify(request.currentPassword, user.passwordHash)) {
            throw IllegalArgumentException("Current password is incorrect")
        }
        userRepository.update(user.copy(
            passwordHash = passwordService.hash(request.newPassword),
            updatedAt = Instant.now()
        ))
    }

    fun refresh(refreshToken: String): AuthResponse {
        val userId = jwtService.validateRefreshToken(refreshToken)
            ?: throw IllegalArgumentException("Invalid refresh token")
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }
        return AuthResponse(
            accessToken = jwtService.generateAccessToken(user.id),
            refreshToken = jwtService.generateRefreshToken(user.id),
            userId = user.id.toString()
        )
    }
}
