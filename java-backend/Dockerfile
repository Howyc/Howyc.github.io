# 第一阶段：构建
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 第二阶段：运行
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# 数据目录
RUN mkdir -p /app/data

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
