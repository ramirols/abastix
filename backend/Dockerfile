# ============================================================
# ETAPA 1: Compilacion del Backend con Maven y Java 21
# ============================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copiar el archivo pom.xml del backend para cache de dependencias
COPY backend/pom.xml ./pom.xml

# Descargar dependencias para acelerar construcciones subsecuentes
RUN mvn dependency:go-offline -B

# Copiar el codigo fuente del backend
COPY backend/src ./src

# Compilar y empaquetar la aplicacion (omitiendo tests durante el build de imagen)
RUN mvn clean package -DskipTests -B

# ============================================================
# ETAPA 2: Imagen de Ejecucion con JRE 21 Alpine y Usuario No Privilegiado
# ============================================================
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# Crear usuario y grupo sin privilegios para ejecucion segura
RUN addgroup -S abastix && adduser -S abastix -G abastix

# Instalar curl para healthchecks del contenedor
RUN apk add --no-cache curl

# Copiar el archivo JAR generado desde la etapa de compilacion
COPY --from=builder /build/target/*.jar /app/app.jar

# Asignar permisos al usuario no privilegiado
RUN chown -R abastix:abastix /app

# Cambiar al usuario no privilegiado
USER abastix

# Exponer el puerto de Spring Boot
EXPOSE 8088

# Variables por defecto del JVM para contenedor
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Healthcheck interno contra endpoint publico de la API
HEALTHCHECK --interval=20s --timeout=5s --retries=5 --start-period=30s \
  CMD curl -f http://localhost:8088/api/auth/csrf || exit 1

# Comando de ejecucion con soporte de senales SIGTERM
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
