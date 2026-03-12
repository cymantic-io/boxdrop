package com.cymantic.boxdrop.transactions

import io.micronaut.context.annotation.Value
import jakarta.inject.Singleton
import java.math.BigDecimal

@Singleton
class StripeService(
    @Value("\${boxdrop.stripe.api-key}") private val apiKey: String,
    @Value("\${boxdrop.stripe.webhook-secret}") private val webhookSecret: String
) {
    fun createPaymentIntent(amount: BigDecimal, currency: String = "usd"): String {
        // TODO: Integrate Stripe SDK — com.stripe.Stripe.apiKey = apiKey
        return "pi_placeholder_${System.currentTimeMillis()}"
    }

    fun capturePayment(paymentIntentId: String): Boolean {
        // TODO: Integrate Stripe SDK
        return true
    }

    fun refundPayment(paymentIntentId: String): Boolean {
        // TODO: Integrate Stripe SDK
        return true
    }
}
