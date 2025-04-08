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
COPY apps/ .
RUN pnpm build

# Create the final runtime image
FROM base AS runner
WORKDIR /app

# Set environment variable for production
ENV NODE_ENV=production

# Copy only the necessary files from the build stage
# COPY --from=build /app .
# Copy standalone output + static + public

# Copy root package.json so pnpm start can work
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app/apps/braccoli-site-2.0/.next/standalone/apps/braccoli-site-2.0 ./apps/braccoli-site-2.0
COPY --from=build /app/apps/braccoli-site-2.0/.next/static ./apps/braccoli-site-2.0/.next/static
COPY --from=build /app/apps/braccoli-site-2.0/public ./apps/braccoli-site-2.0/public

COPY --from=build /app/apps/braccoli-bites/.next/standalone/apps/braccoli-bites ./apps/braccoli-bites
COPY --from=build /app/apps/braccoli-bites/.next/static ./apps/braccoli-bites/.next/static
COPY --from=build /app/apps/braccoli-bites/public ./apps/braccoli-bites/public


# Expose necessary ports (if required)
EXPOSE 3000 3001

# Start the production server
# CMD ["pnpm", "start"]

CMD ["sh", "-c", "node apps/braccoli-site-2.0/server.js & PORT=3001 node apps/braccoli-bites/server.js"]