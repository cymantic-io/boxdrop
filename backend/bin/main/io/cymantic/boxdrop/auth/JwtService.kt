package io.cymantic.boxdrop.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import io.micronaut.context.annotation.Value
import jakarta.inject.Singleton
import java.time.Instant
import java.util.UUID

@Singleton
class JwtService(
    @Value("\${boxdrop.jwt.secret}") private val secret: String,
    @Value("\${boxdrop.jwt.access-token-expiry}") private val accessTokenExpiry: Long,
    @Value("\${boxdrop.jwt.refresh-token-expiry}") private val refreshTokenExpiry: Long
) {
    private val algorithm = Algorithm.HMAC256(secret)
    private val verifier = JWT.require(algorithm).build()

    fun generateAccessToken(userId: UUID): String =
        JWT.create()
            .withSubject(userId.toString())
            .withClaim("type", "access")
            .withIssuedAt(Instant.now())
            .withExpiresAt(Instant.now().plusSeconds(accessTokenExpiry))
            .sign(algorithm)

    fun generateRefreshToken(userId: UUID): String =
        JWT.create()
            .withSubject(userId.toString())
            .withClaim("type", "refresh")
            .withIssuedAt(Instant.now())
            .withExpiresAt(Instant.now().plusSeconds(refreshTokenExpiry))
            .sign(algorithm)

    fun validateToken(token: String): UUID? =
        try {
            val decoded = verifier.verify(token)
            UUID.fromString(decoded.subject)
        } catch (e: JWTVerificationException) {
            null
        }

    fun validateRefreshToken(token: String): UUID? =
        try {
            val decoded = verifier.verify(token)
            if (decoded.getClaim("type").asString() == "refresh") UUID.fromString(decoded.subject) else null
        } catch (e: JWTVerificationException) {
            null
        }
}
