FROM amazoncorretto:21

RUN mkdir -p /server
WORKDIR /server

RUN yum update -y && \
    yum install -y wget unzip

COPY ./src/. /server/
COPY ./.mvn/. /server/
COPY ./pom.xml /server/
COPY ./mvnw /server/

RUN chmod +x mvnw

# Download and install Kotlin
RUN wget -O kotlin.zip https://github.com/JetBrains/kotlin/releases/download/v1.5.31/kotlin-compiler-1.5.31.zip && \
    unzip kotlin.zip && \
    rm kotlin.zip && \
    ln -s /app/kotlinc/bin/kotlin /usr/bin/kotlin


ENTRYPOINT ["./mvnw", "spring-boot:run"]