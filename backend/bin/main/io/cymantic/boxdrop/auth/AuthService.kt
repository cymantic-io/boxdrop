package io.cymantic.boxdrop.auth

import io.cymantic.boxdrop.common.dto.AuthResponse
import io.cymantic.boxdrop.common.dto.LoginStartResponse
import io.cymantic.boxdrop.common.dto.MethodResponse
import io.cymantic.boxdrop.common.dto.TotpSetupResponse
import io.cymantic.boxdrop.common.exceptions.BadRequestException
import io.cymantic.boxdrop.notifications.EmailService
import io.cymantic.boxdrop.notifications.SmsService
import io.cymantic.boxdrop.trust.TrustService
import io.cymantic.boxdrop.users.User
import io.cymantic.boxdrop.users.UserRepository
import com.warrenstrange.googleauth.GoogleAuthenticator
import jakarta.inject.Singleton
import org.slf4j.LoggerFactory
import java.time.Instant
import java.util.UUID

@Singleton
@Suppress("LongParameterList", "TooManyFunctions")
class AuthService(
    private val userRepository: UserRepository,
    private val verificationMethodRepository: VerificationMethodRepository,
    private val verificationService: VerificationService,
    private val jwtService: JwtService,
    private val trustService: TrustService,
    private val emailService: EmailService,
    private val smsService: SmsService
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java)
    private val googleAuthenticator = GoogleAuthenticator()

    fun register(email: String, displayName: String?): String {
        if (userRepository.existsByEmail(email)) {
            throw IllegalArgumentException("Email already registered")
        }
        val user = userRepository.save(User(
            id = UUID.randomUUID(),
            email = email,
            passwordHash = null,
            displayName = displayName,
            avatarUrl = null,
            address = null,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        ))
        trustService.initializeScore(user.id)
        verificationMethodRepository.save(VerificationMethod(
            id = UUID.randomUUID(),
            userId = user.id,
            methodType = "EMAIL_OTP",
            enabled = true,
            totpSecret = null,
            phoneNumber = null,
            createdAt = Instant.now()
        ))
        val challengeId = verificationService.createChallenge(user.id, email, "register")
        val otp = verificationService.generateAndStoreOtp(challengeId)
        emailService.sendOtp(email, otp)
        return challengeId
    }

    fun verifyRegistration(challengeId: String, code: String): AuthResponse {
        val challenge = verificationService.getChallenge(challengeId)
        verificationService.validateOtp(challengeId, code)
        val userId = UUID.fromString(challenge.userId)
        return AuthResponse(
            accessToken = jwtService.generateAccessToken(userId),
            refreshToken = jwtService.generateRefreshToken(userId),
            userId = challenge.userId
        )
    }

    fun loginStart(email: String): LoginStartResponse {
        val user = userRepository.findByEmail(email)
            .orElseThrow { IllegalArgumentException("Invalid credentials") }
        val methods = verificationMethodRepository.findByUserIdAndEnabled(user.id, true)
        if (methods.isEmpty()) {
            throw IllegalArgumentException("Invalid credentials")
        }
        val challengeId = verificationService.createChallenge(user.id, email, "login")
        return LoginStartResponse(
            challengeId = challengeId,
            methods = methods.map { it.methodType }
        )
    }

    fun sendLoginCode(challengeId: String, method: String) {
        val challenge = verificationService.getChallenge(challengeId)
        when (method) {
            "EMAIL_OTP" -> {
                val otp = verificationService.generateAndStoreOtp(challengeId)
                emailService.sendOtp(challenge.email, otp)
            }
            "SMS_OTP" -> {
                val otp = verificationService.generateAndStoreOtp(challengeId)
                val userId = UUID.fromString(challenge.userId)
                val vm = verificationMethodRepository.findByUserIdAndMethodType(userId, "SMS_OTP")
                    .orElseThrow { BadRequestException("SMS not configured") }
                smsService.sendOtp(vm.phoneNumber!!, otp)
            }
            "TOTP" -> { /* no-op */ }
            else -> throw BadRequestException("Unsupported method: $method")
        }
    }

    fun loginVerify(challengeId: String, method: String, code: String): AuthResponse {
        val challenge = verificationService.getChallenge(challengeId)
        val userId = UUID.fromString(challenge.userId)
        when (method) {
            "EMAIL_OTP", "SMS_OTP" -> verificationService.validateOtp(challengeId, code)
            "TOTP" -> {
                val vm = verificationMethodRepository.findByUserIdAndMethodType(userId, "TOTP")
                    .orElseThrow { BadRequestException("TOTP not configured") }
                verificationService.validateTotp(vm.totpSecret!!, code)
            }
            else -> throw BadRequestException("Unsupported method: $method")
        }
        return AuthResponse(
            accessToken = jwtService.generateAccessToken(userId),
            refreshToken = jwtService.generateRefreshToken(userId),
            userId = challenge.userId
        )
    }

    fun setupTotp(userId: UUID): TotpSetupResponse {
        val credentials = googleAuthenticator.createCredentials()
        verificationService.storeTotpSetupSecret(userId, credentials.key)
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }
        val qrUri = "otpauth://totp/BoxDrop:${user.email}?secret=${credentials.key}&issuer=BoxDrop"
        return TotpSetupResponse(secret = credentials.key, qrUri = qrUri)
    }

    fun confirmTotp(userId: UUID, code: String) {
        val secret = verificationService.getTotpSetupSecret(userId)
        verificationService.validateTotp(secret, code)
        verificationMethodRepository.save(VerificationMethod(
            id = UUID.randomUUID(),
            userId = userId,
            methodType = "TOTP",
            enabled = true,
            totpSecret = secret,
            phoneNumber = null,
            createdAt = Instant.now()
        ))
        verificationService.deleteTotpSetupSecret(userId)
    }

    fun setupSms(userId: UUID, phoneNumber: String): String {
        val challengeId = UUID.randomUUID().toString()
        verificationService.storeSmsSetup(challengeId, userId, phoneNumber)
        val otp = verificationService.generateAndStoreOtp(challengeId)
        smsService.sendOtp(phoneNumber, otp)
        return challengeId
    }

    fun confirmSms(userId: UUID, challengeId: String, code: String) {
        verificationService.validateOtp(challengeId, code)
        val smsSetup = verificationService.getSmsSetup(challengeId)
        verificationMethodRepository.save(VerificationMethod(
            id = UUID.randomUUID(),
            userId = userId,
            methodType = "SMS_OTP",
            enabled = true,
            totpSecret = null,
            phoneNumber = smsSetup.phoneNumber,
            createdAt = Instant.now()
        ))
    }

    fun getMethods(userId: UUID): List<MethodResponse> {
        return verificationMethodRepository.findByUserId(userId).map { vm ->
            MethodResponse(
                type = vm.methodType,
                enabled = vm.enabled,
                hasPhoneNumber = vm.phoneNumber != null
            )
        }
    }

    fun removeMethod(userId: UUID, methodType: String) {
        val method = verificationMethodRepository.findByUserIdAndMethodType(userId, methodType)
            .orElseThrow { BadRequestException("Method not found") }
        val enabledMethods = verificationMethodRepository.findByUserIdAndEnabled(userId, true)
        if (enabledMethods.size <= 1 && method.enabled) {
            throw BadRequestException("Cannot remove the last enabled verification method")
        }
        verificationMethodRepository.delete(method)
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
