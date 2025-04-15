# Use official Node.js image as base
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install Git and PNPM globally
RUN apk add --no-cache git && npm install -g pnpm@latest

# Install dependencies
FROM base AS deps
COPY package.json turbo.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Fetch apps and build them
FROM deps AS build
COPY . .
ARG BUILD_ENV_CONTENT
RUN pnpm get-app braccoli-site-2.0 && pnpm get-app braccoli-bites
RUN echo -e "$BUILD_ENV_CONTENT" > .env.temp && \
    cp .env.temp apps/braccoli-site-2.0/.env && \
    cp .env.temp apps/braccoli-bites/.env
RUN pnpm build

# Create the final runtime image
FROM base AS runner
WORKDIR /app

# Set environment variable for production
ENV NODE_ENV=production

# Copy only the necessary files from the build stage
COPY --from=build /app .

# Expose necessary ports (if required)
EXPOSE 3000 3001

# Start the production server
CMD ["pnpm", "start"]