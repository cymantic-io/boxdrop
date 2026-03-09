package com.boxdrop.images

import com.boxdrop.common.dto.ApiResponse
import io.micronaut.http.HttpResponse
import io.micronaut.http.MediaType
import io.micronaut.http.annotation.Consumes
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Part
import io.micronaut.http.annotation.Post
import io.micronaut.http.multipart.CompletedFileUpload
import io.micronaut.serde.annotation.Serdeable

@Serdeable
data class UploadResponse(val url: String)

@Controller("/api/images")
class ImageController(private val imageStorageService: ImageStorageService) {

    @Post("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    fun upload(@Part file: CompletedFileUpload): HttpResponse<ApiResponse<UploadResponse>> {
        val url = imageStorageService.upload(
            file.inputStream,
            file.contentType.orElse(MediaType.APPLICATION_OCTET_STREAM_TYPE).toString(),
            file.size
        )
        return HttpResponse.ok(ApiResponse(UploadResponse(url)))
    }
}
