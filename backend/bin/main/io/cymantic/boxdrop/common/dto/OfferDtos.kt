@file:Suppress("MatchingDeclarationName")
package io.cymantic.boxdrop.common.dto

import io.micronaut.serde.annotation.Serdeable

@Serdeable
data class CreateOfferResponse(
    val thread: ThreadResponse,
    val offer: OfferResponse
)
