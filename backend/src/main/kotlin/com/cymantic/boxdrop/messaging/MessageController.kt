package com.cymantic.boxdrop.messaging

import com.cymantic.boxdrop.common.dto.*
import com.cymantic.boxdrop.common.extensions.userId
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.*
import java.util.UUID

@Controller("/api/messages/threads")
class MessageController(private val messageService: MessageService) {

    @Post
    fun createThread(request: HttpRequest<*>, @Body body: CreateThreadRequest): HttpResponse<ApiResponse<ThreadResponse>> =
        HttpResponse.created(ApiResponse(messageService.getOrCreateThread(request.userId(), body)))

    @Get
    fun getThreads(request: HttpRequest<*>): HttpResponse<ApiResponse<List<ThreadResponse>>> =
        HttpResponse.ok(ApiResponse(messageService.getThreads(request.userId())))

    @Get("/{id}")
    fun getMessages(request: HttpRequest<*>, @PathVariable id: UUID): HttpResponse<ApiResponse<ThreadDetailResponse>> =
        HttpResponse.ok(ApiResponse(messageService.getThreadDetail(id, request.userId())))

    @Post("/{id}")
    fun sendMessage(request: HttpRequest<*>, @PathVariable id: UUID, @Body body: SendMessageRequest): HttpResponse<ApiResponse<MessageResponse>> =
        HttpResponse.created(ApiResponse(messageService.sendMessage(id, request.userId(), body)))
}
