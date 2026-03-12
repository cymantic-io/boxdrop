package com.cymantic.boxdrop.common.extensions

import com.cymantic.boxdrop.common.exceptions.UnauthorizedException
import io.micronaut.http.HttpRequest
import java.util.UUID

fun HttpRequest<*>.userId(): UUID =
    getAttribute("userId", UUID::class.java)
        .orElseThrow { UnauthorizedException("Authentication required") }
