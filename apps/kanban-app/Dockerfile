FROM amazoncorretto:8 AS build
RUN mkdir -p /workspace
WORKDIR /workspace
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml /workspace
COPY src /workspace/src
RUN ./mvnw -f pom.xml clean package

FROM amazoncorretto:8
COPY --from=build /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
