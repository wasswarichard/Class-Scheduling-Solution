# Multi-stage Dockerfile for Spring Boot backend with SWI-Prolog and Haskell GA binary

# 1) Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom and sources
COPY pom.xml ./
COPY src ./src
COPY haskell ./haskell
COPY prolog ./prolog

# Build the jar (skip tests for faster container build; adjust if you want tests)
RUN mvn -q -DskipTests package

# 2) Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app

# Install SWI-Prolog for validator, GHC (for runghc fallback), and Haskell Stack
# Also pre-install Stack resolver lts-21.25 so haskell/ga-exec can run with Stack immediately
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       swi-prolog-nox \
       ghc \
       curl \
       ca-certificates \
       xz-utils \
    && curl -sSL https://get.haskellstack.org/ | sh \
    && stack --version \
    && stack update \
    && stack setup --resolver lts-21.25 \
    && echo 'main = putStrLn "ok"' > /tmp/Deps.hs \
    && stack script \
         --resolver lts-21.25 \
         --package aeson \
         --package bytestring \
         --package random \
         /tmp/Deps.hs \
    && rm -f /tmp/Deps.hs \
    && rm -rf /var/lib/apt/lists/*

# Copy built JAR and required tool folders
COPY --from=build /app/target/*.jar /app/app.jar
COPY --from=build /app/prolog /app/prolog
COPY --from=build /app/haskell /app/haskell

# Ensure haskell/ga-exec is executable
RUN chmod +x /app/haskell/ga-exec || true

# Default environment configuration
ENV SERVER_PORT=8080 \
    APP_CORS_ALLOWED_ORIGINS=* \
    APP_PROCESS_TIMEOUT_SECONDS=20 \
    APP_HASKELL_GA_COMMAND="haskell/ga-exec" \
    APP_PROLOG_VALIDATOR_COMMAND="swipl -q -s prolog/validator.pl -t main"

EXPOSE 8080

# Map environment variables to Spring Boot properties via command line
ENTRYPOINT ["sh", "-c", \
  "java -jar \"/app/app.jar\" \
    --server.port=${SERVER_PORT} \
    --app.cors.allowed-origins=${APP_CORS_ALLOWED_ORIGINS} \
    --app.process.timeout.seconds=${APP_PROCESS_TIMEOUT_SECONDS} \
    --app.haskell.ga.command=${APP_HASKELL_GA_COMMAND} \
    --app.prolog.validator.command='${APP_PROLOG_VALIDATOR_COMMAND}'"]
