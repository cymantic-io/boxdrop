package io.cymantic.boxdrop.moderation

import io.cymantic.boxdrop.common.dto.ApiResponse
import io.cymantic.boxdrop.common.dto.ReportRequest
import io.cymantic.boxdrop.common.extensions.userId
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.Body
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Post
import java.time.Instant
import java.util.UUID

@Controller("/api/reports")
class ReportController(private val reportRepository: ReportRepository) {

    @Post
    fun create(request: HttpRequest<*>, @Body body: ReportRequest): HttpResponse<ApiResponse<String>> {
        reportRepository.save(Report(
            UUID.randomUUID(), request.userId(), body.targetType,
            UUID.fromString(body.targetId), body.reason, "OPEN", Instant.now(), null
        ))
        return HttpResponse.created(ApiResponse("Report submitted"))
    }
}
