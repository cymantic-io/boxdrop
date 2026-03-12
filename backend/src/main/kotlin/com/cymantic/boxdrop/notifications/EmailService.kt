package com.cymantic.boxdrop.notifications

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.micronaut.context.annotation.Value
import jakarta.inject.Singleton
import org.slf4j.LoggerFactory
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

@Singleton
class EmailService(
    @Value("\${boxdrop.resend.api-key:}") private val apiKey: String,
    @Value("\${boxdrop.resend.from-email:onboarding@resend.dev}") private val fromEmail: String
) {
    private val logger = LoggerFactory.getLogger(EmailService::class.java)
    private val httpClient = HttpClient.newHttpClient()
    private val objectMapper = jacksonObjectMapper()

    fun sendOtp(toEmail: String, code: String) {
        if (apiKey.isBlank()) {
            logger.warn("Resend API key not configured — logging OTP instead. Code for {}: {}", toEmail, code)
            return
        }
        try {
            val body = objectMapper.writeValueAsString(mapOf(
                "from" to fromEmail,
                "to" to listOf(toEmail),
                "subject" to "Your BoxDrop verification code",
                "html" to """
                    <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
                        <h2 style="color: #264653;">BoxDrop</h2>
                        <p>Your verification code is:</p>
                        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2A9D8F; margin: 24px 0;">$code</p>
                        <p style="color: #666;">This code expires in 10 minutes.</p>
                    </div>
                """.trimIndent()
            ))
            val request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer $apiKey")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build()
            val response = httpClient.send(request, HttpResponse.BodyHandlers.ofString())
            if (response.statusCode() in 200..299) {
                logger.info("Email OTP sent to {}", toEmail)
            } else {
                logger.error("Failed to send email via Resend: {} {}", response.statusCode(), response.body())
            }
        } catch (e: Exception) {
            logger.error("Failed to send email to {}: {}", toEmail, e.message)
        }
    }
}
