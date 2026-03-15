package io.cymantic.boxdrop.images

import io.micronaut.context.annotation.Value
import jakarta.inject.Singleton
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.io.InputStream
import java.net.URI
import java.util.UUID

@Singleton
class ImageStorageService(
    @Value("\${boxdrop.s3.bucket}") private val bucket: String,
    @Value("\${boxdrop.s3.region}") private val region: String,
    @Value("\${boxdrop.s3.endpoint}") private val endpoint: String,
    @Value("\${boxdrop.s3.access-key}") private val accessKey: String,
    @Value("\${boxdrop.s3.secret-key}") private val secretKey: String
) {
    private val s3Client: S3Client by lazy {
        S3Client.builder()
            .region(Region.of(region))
            .endpointOverride(URI.create(endpoint))
            .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
            .forcePathStyle(true)
            .build()
    }

    fun upload(inputStream: InputStream, contentType: String, size: Long): String {
        val key = "listings/${UUID.randomUUID()}"
        s3Client.putObject(
            PutObjectRequest.builder().bucket(bucket).key(key).contentType(contentType).build(),
            RequestBody.fromInputStream(inputStream, size)
        )
        return "$endpoint/$bucket/$key"
    }
}
