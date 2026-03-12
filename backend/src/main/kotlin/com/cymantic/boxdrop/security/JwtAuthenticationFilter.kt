package com.cymantic.boxdrop.security

import com.cymantic.boxdrop.auth.JwtService
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.MutableHttpResponse
import io.micronaut.http.annotation.Filter
import io.micronaut.http.filter.HttpServerFilter
import io.micronaut.http.filter.ServerFilterChain
import org.reactivestreams.Publisher
import reactor.core.publisher.Mono

@Filter("/api/**")
class JwtAuthenticationFilter(private val jwtService: JwtService) : HttpServerFilter {

    private val publicPaths = setOf(
        "/api/auth/register",
        "/api/auth/register/verify",
        "/api/auth/login/start",
        "/api/auth/login/send-code",
        "/api/auth/login/verify",
        "/api/auth/refresh",
        "/api/webhooks/stripe"
    )

    override fun doFilter(request: HttpRequest<*>, chain: ServerFilterChain): Publisher<MutableHttpResponse<*>> {
        if (publicPaths.any { request.path.startsWith(it) } || request.method.name == "OPTIONS") {
            return chain.proceed(request)
        }
        val authHeader = request.headers.authorization.orElse(null)
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            val userId = jwtService.validateToken(authHeader.substring(7))
            if (userId != null) {
                request.setAttribute("userId", userId)
            }
        }
        return chain.proceed(request)
    }
}
