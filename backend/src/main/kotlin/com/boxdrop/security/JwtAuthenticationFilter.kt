package com.boxdrop.security

import com.boxdrop.auth.JwtService
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
        "/api/auth/login",
        "/api/auth/refresh",
        "/api/webhooks/stripe"
    )

    override fun doFilter(request: HttpRequest<*>, chain: ServerFilterChain): Publisher<MutableHttpResponse<*>> {
        if (publicPaths.any { request.path.startsWith(it) } || request.method.name == "OPTIONS") {
            return chain.proceed(request)
        }
        val authHeader = request.headers.authorization.orElse(null)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Mono.just(HttpResponse.unauthorized<Any>())
        }
        val userId = jwtService.validateToken(authHeader.substring(7))
            ?: return Mono.just(HttpResponse.unauthorized<Any>())
        request.setAttribute("userId", userId)
        return chain.proceed(request)
    }
}
