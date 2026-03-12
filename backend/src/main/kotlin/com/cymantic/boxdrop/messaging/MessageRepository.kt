package com.cymantic.boxdrop.messaging

import io.micronaut.data.annotation.Query
import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository
import java.util.UUID

@JdbcRepository(dialect = Dialect.POSTGRES)
interface MessageRepository : CrudRepository<Message, UUID> {
    fun findByThreadIdOrderByCreatedAt(threadId: UUID): List<Message>

    @Query("UPDATE messages SET read_at = now() WHERE thread_id = :threadId AND sender_id != :userId AND read_at IS NULL")
    fun markAsRead(threadId: UUID, userId: UUID)
}
