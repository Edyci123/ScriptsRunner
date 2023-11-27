FROM amazoncorretto:latest

RUN mkdir -p /server
WORKDIR /server

COPY ./src/. /server/
COPY ./.mvn/. /server/
COPY ./pom.xml /server/
COPY ./mvnw /server/

# Download and install Kotlin
RUN wget -O kotlin.zip https://github.com/JetBrains/kotlin/releases/download/v1.5.31/kotlin-compiler-1.5.31.zip && \
    unzip kotlin.zip && \
    rm kotlin.zip && \
    ln -s /app/kotlinc/bin/kotlin /usr/bin/kotlin


ENTRYPOINT ["./mvnw", "spring-boot:run"]