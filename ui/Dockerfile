# Multi-stage Dockerfile for Next.js UI

# 1) Build stage
FROM node:22-alpine AS build
WORKDIR /app

COPY ui/package.json ui/package-lock.json ./
# Use legacy peer deps to allow React 19 with packages (e.g., vaul@0.9.9) that still declare React ^16/17/18 peer ranges
RUN npm ci --legacy-peer-deps

COPY ui ./
RUN npm run build

# 2) Runtime stage
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app .

EXPOSE 3000
CMD ["npm", "run", "start"]
