package io.cymantic.boxdrop.notifications

import io.micronaut.context.annotation.Value
import jakarta.inject.Singleton
import org.slf4j.LoggerFactory
import java.net.URI
import java.net.URLEncoder
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.util.Base64

@Singleton
class SmsService(
    @Value("\${boxdrop.twilio.account-sid:}") private val accountSid: String,
    @Value("\${boxdrop.twilio.auth-token:}") private val authToken: String,
    @Value("\${boxdrop.twilio.from-number:}") private val fromNumber: String
) {
    private val logger = LoggerFactory.getLogger(SmsService::class.java)
    private val httpClient = HttpClient.newHttpClient()

    fun sendOtp(toPhone: String, code: String) {
        if (accountSid.isBlank() || authToken.isBlank() || fromNumber.isBlank()) {
            logger.warn("Twilio not configured — logging OTP instead. Code for {}: {}", toPhone, code)
            return
        }
        try {
            val formBody = listOf(
                "To" to toPhone,
                "From" to fromNumber,
                "Body" to "Your BoxDrop verification code is: $code"
            ).joinToString("&") { (k, v) ->
                "${URLEncoder.encode(k, "UTF-8")}=${URLEncoder.encode(v, "UTF-8")}"
            }
            val credentials = Base64.getEncoder().encodeToString("$accountSid:$authToken".toByteArray())
            val request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.twilio.com/2010-04-01/Accounts/$accountSid/Messages.json"))
                .header("Authorization", "Basic $credentials")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(formBody))
                .build()
            val response = httpClient.send(request, HttpResponse.BodyHandlers.ofString())
            if (response.statusCode() in 200..299) {
                logger.info("SMS OTP sent to {}", toPhone)
            } else {
                logger.error("Failed to send SMS via Twilio: {} {}", response.statusCode(), response.body())
            }
        } catch (e: Exception) {
            logger.error("Failed to send SMS to {}: {}", toPhone, e.message)
        }
    }
}
