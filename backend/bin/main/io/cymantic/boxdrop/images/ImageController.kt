package io.cymantic.boxdrop.images

import io.cymantic.boxdrop.common.dto.ApiResponse
import io.cymantic.boxdrop.common.dto.ErrorResponse
import io.micronaut.http.HttpResponse
import io.micronaut.http.MediaType
import io.micronaut.http.annotation.Consumes
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Part
import io.micronaut.http.annotation.Post
import io.micronaut.http.multipart.CompletedFileUpload
import io.micronaut.serde.annotation.Serdeable
import java.io.ByteArrayInputStream
import javax.imageio.ImageIO

@Serdeable
data class UploadResponse(val url: String)

@Controller("/api/images")
class ImageController(private val imageStorageService: ImageStorageService) {

    companion object {
        private const val MAX_FILE_SIZE = 12L * 1024 * 1024
        private const val MIN_DIMENSION = 500
        private const val MAX_DIMENSION = 9000
        private val ALLOWED_CONTENT_TYPES = setOf(
            MediaType.IMAGE_JPEG,
            MediaType.IMAGE_PNG,
            MediaType.IMAGE_GIF,
            "image/tiff",
            "image/bmp",
            "image/webp"
        )
    }

    @Post("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Suppress("ReturnCount")
    fun upload(@Part file: CompletedFileUpload): HttpResponse<*> {
        if (file.size > MAX_FILE_SIZE)
            return HttpResponse.badRequest(ErrorResponse("Bad Request", "Image file size must not exceed 12 MB", 400))

        val contentType = file.contentType.orElse(MediaType.APPLICATION_OCTET_STREAM_TYPE).toString()
        if (contentType !in ALLOWED_CONTENT_TYPES)
            return HttpResponse.badRequest(ErrorResponse("Bad Request", "Unsupported image format. Accepted: JPEG, PNG, GIF, TIFF, BMP, WEBP", 400))

        val bytes = file.bytes
        val image = ImageIO.read(ByteArrayInputStream(bytes))
            ?: return HttpResponse.badRequest(ErrorResponse(
                error = "Bad Request",
                message = "Unsupported image format. Accepted: JPEG, PNG, GIF, TIFF, BMP, WEBP",
                status = 400
            ))

        if (image.width < MIN_DIMENSION || image.height < MIN_DIMENSION)
            return HttpResponse.badRequest(ErrorResponse("Bad Request", "Image dimensions must be at least 500 × 500 pixels", 400))

        if (image.width > MAX_DIMENSION || image.height > MAX_DIMENSION)
            return HttpResponse.badRequest(ErrorResponse("Bad Request", "Image dimensions must not exceed 9000 × 9000 pixels", 400))

        val url = imageStorageService.upload(
            ByteArrayInputStream(bytes),
            contentType,
            bytes.size.toLong()
        )
        return HttpResponse.ok(ApiResponse(UploadResponse(url)))
    }
}
