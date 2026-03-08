plugins {
    kotlin("kapt") version "1.9.22"
    kotlin("jvm") version "1.9.22"
    id("io.micronaut.application") version "4.2.0"
    id("io.gitlab.arturbosch.detekt") version "1.23.6"
    id("org.owasp.dependencycheck") version "9.0.9"
}

group = "com.garagesale"
version = "0.1"

repositories {
    mavenCentral()
}

micronaut {
    version("4.3.8")
    runtime("netty")
    testRuntime("junit5")
    processing {
        incremental(true)
        annotations("com.garagesale.*")
    }
}

dependencies {
    kapt("io.micronaut.data:micronaut-data-processor")
    kapt("io.micronaut.serde:micronaut-serde-processor")

    implementation("io.micronaut:micronaut-http-server-netty")
    implementation("io.micronaut:micronaut-runtime")
    implementation("io.micronaut:micronaut-websocket")
    implementation("io.micronaut.data:micronaut-data-jdbc")
    implementation("io.micronaut.flyway:micronaut-flyway")
    implementation("org.flywaydb:flyway-database-postgresql:10.6.0")
    implementation("io.micronaut.redis:micronaut-redis-lettuce")
    implementation("io.micronaut.sql:micronaut-jdbc-hikari")
    implementation("io.micronaut.serde:micronaut-serde-jackson")

    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    implementation("com.auth0:java-jwt:4.4.0")
    implementation("org.mindrot:jbcrypt:0.4")
    implementation("software.amazon.awssdk:s3:2.25.5")
    implementation("com.stripe:stripe-java:25.0.0")
    implementation("io.projectreactor:reactor-core")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    runtimeOnly("org.postgresql:postgresql:42.7.2")
    runtimeOnly("org.yaml:snakeyaml")
    runtimeOnly("ch.qos.logback:logback-classic")

    testImplementation("io.micronaut.test:micronaut-test-junit5")
    testImplementation("org.junit.jupiter:junit-jupiter-api")
    testImplementation("org.testcontainers:junit-jupiter:1.19.7")
    testImplementation("org.testcontainers:postgresql:1.19.7")
    testImplementation("io.mockk:mockk:1.13.10")

    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
}

application {
    mainClass.set("com.garagesale.ApplicationKt")
}

tasks.test {
    useJUnitPlatform()
}

detekt {
    config.setFrom(files("detekt.yml"))
    buildUponDefaultConfig = true
}
