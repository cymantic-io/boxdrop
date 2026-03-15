package io.cymantic.boxdrop.security

import io.lettuce.core.api.StatefulRedisConnection
import io.micronaut.context.annotation.Value
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.HttpStatus
import io.micronaut.http.MutableHttpResponse
import io.micronaut.http.annotation.Filter
import io.micronaut.http.filter.HttpServerFilter
import io.micronaut.http.filter.ServerFilterChain
import org.reactivestreams.Publisher
import reactor.core.publisher.Mono

@Filter("/api/**")
@io.micronaut.core.annotation.Order(1)
class RateLimitFilter(
    private val redisConnection: StatefulRedisConnection<String, String>,
    @Value("\${boxdrop.rate-limit.max-requests:100}") private val maxRequests: Long,
    @Value("\${boxdrop.rate-limit.window-seconds:60}") private val windowSeconds: Long
) : HttpServerFilter {

    override fun doFilter(request: HttpRequest<*>, chain: ServerFilterChain): Publisher<MutableHttpResponse<*>> {
        val clientIp = request.remoteAddress.address.hostAddress
        val key = "rate_limit:$clientIp"
        val commands = redisConnection.sync()
        val current = commands.incr(key)
        if (current == 1L) {
            commands.expire(key, windowSeconds)
        }
        return if (current > maxRequests) {
            Mono.just(HttpResponse.status<Any>(HttpStatus.TOO_MANY_REQUESTS))
        } else {
            chain.proceed(request)
        }
    }
}
