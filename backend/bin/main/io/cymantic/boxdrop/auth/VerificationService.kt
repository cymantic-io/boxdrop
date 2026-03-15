package io.cymantic.boxdrop.auth

import io.cymantic.boxdrop.common.exceptions.BadRequestException
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.warrenstrange.googleauth.GoogleAuthenticator
import io.lettuce.core.api.StatefulRedisConnection
import jakarta.inject.Singleton
import java.security.SecureRandom
import java.util.*

data class ChallengeData(val userId: String, val email: String, val type: String)
data class SmsSetupData(val userId: String, val phoneNumber: String)

@Singleton
class VerificationService(
    private val redisConnection: StatefulRedisConnection<String, String>
) {
    private val objectMapper = jacksonObjectMapper()
    private val secureRandom = SecureRandom()
    private val googleAuthenticator = GoogleAuthenticator()

    fun createChallenge(userId: UUID, email: String, type: String): String {
        val challengeId = UUID.randomUUID().toString()
        val json = objectMapper.writeValueAsString(ChallengeData(userId.toString(), email, type))
        redisConnection.sync().setex("auth_challenge:$challengeId", 600, json)
        return challengeId
    }

    fun getChallenge(challengeId: String): ChallengeData {
        val json = redisConnection.sync().get("auth_challenge:$challengeId")
            ?: throw BadRequestException("Invalid or expired challenge")
        return objectMapper.readValue(json)
    }

    fun generateAndStoreOtp(challengeId: String): String {
        val code = String.format(Locale.getDefault(), "%06d", secureRandom.nextInt(1000000))
        redisConnection.sync().setex("auth_otp:$challengeId", 600, code)
        return code
    }

    fun validateOtp(challengeId: String, code: String) {
        val storedCode = redisConnection.sync().get("auth_otp:$challengeId")
            ?: throw BadRequestException("Invalid or expired code")
        if (storedCode != code) {
            throw BadRequestException("Invalid code")
        }
        redisConnection.sync().del("auth_otp:$challengeId", "auth_challenge:$challengeId")
    }

    fun validateTotp(secret: String, code: String) {
        if (!googleAuthenticator.authorize(secret, code.toInt())) {
            throw BadRequestException("Invalid TOTP code")
        }
    }

    fun storeTotpSetupSecret(userId: UUID, secret: String) {
        redisConnection.sync().setex("totp_setup:$userId", 600, secret)
    }

    fun getTotpSetupSecret(userId: UUID): String {
        return redisConnection.sync().get("totp_setup:$userId")
            ?: throw BadRequestException("No TOTP setup in progress")
    }

    fun deleteTotpSetupSecret(userId: UUID) {
        redisConnection.sync().del("totp_setup:$userId")
    }

    fun storeSmsSetup(challengeId: String, userId: UUID, phoneNumber: String) {
        val json = objectMapper.writeValueAsString(SmsSetupData(userId.toString(), phoneNumber))
        redisConnection.sync().setex("sms_setup:$challengeId", 600, json)
    }

    fun getSmsSetup(challengeId: String): SmsSetupData {
        val json = redisConnection.sync().get("sms_setup:$challengeId")
            ?: throw BadRequestException("Invalid or expired SMS setup")
        return objectMapper.readValue(json)
    }
}
