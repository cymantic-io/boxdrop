package com.cymantic.boxdrop.auth

import jakarta.inject.Singleton
import org.mindrot.jbcrypt.BCrypt

@Singleton
class PasswordService {
    fun hash(password: String): String = BCrypt.hashpw(password, BCrypt.gensalt(12))
    fun verify(password: String, hash: String): Boolean = BCrypt.checkpw(password, hash)
}
