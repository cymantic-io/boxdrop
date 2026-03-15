package io.cymantic.boxdrop.common.exceptions

class NotFoundException(message: String) : RuntimeException(message)
class UnauthorizedException(message: String) : RuntimeException(message)
class BadRequestException(message: String) : RuntimeException(message)
