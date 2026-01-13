# Base image
FROM node:20-alpine AS base

WORKDIR /app

# Install required system deps
RUN apk add --no-cache git

# Install pnpm (pin version for safety)
RUN npm install -g pnpm@9.0.0

# Dependencies stage
FROM base AS deps

COPY package.json turbo.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies (no scripts at runtime)
RUN pnpm install --frozen-lockfile

# Build stage
FROM deps AS build

COPY . .

ARG BUILD_ENV_CONTENT

RUN pnpm get-app braccoli-site-2.0 \
 && pnpm get-app braccoli-bites

RUN echo -e "$BUILD_ENV_CONTENT" > .env.temp \
 && cp .env.temp apps/braccoli-site-2.0/.env \
 && cp .env.temp apps/braccoli-bites/.env \
 && rm .env.temp

RUN pnpm build

# Runtime stage (SECURED)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# ---- Security hardening ----

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

# Lock down temp directories (prevents exec when combined with tmpfs:noexec)
RUN chmod 700 /tmp /var/tmp

# Copy build output
COPY --from=build /app /app

# Ensure correct ownership
RUN chown -R app:app /app

# Switch to non-root
USER app

EXPOSE 3000 3001

CMD ["pnpm", "start"]
