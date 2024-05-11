# Use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:latest as base
WORKDIR /usr/src/app

# Install dependencies in a separate stage to leverage Docker cache
FROM base AS dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Install production-only dependencies in another stage
FROM base AS production-dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Build the Next.js application
FROM base AS builder
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN bun --bun run build

# Run the Next.js build output in the final stage
FROM base AS release
ENV NODE_ENV=production
# Copy production node_modules
COPY --from=production-dependencies /usr/src/app/node_modules ./node_modules
# Copy Next.js build output
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/next.config.mjs ./next.config.mjs
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package.json ./package.json

# Expose the port Next.js runs on
EXPOSE 3000

# Set user to non-root "bun"
USER bun

# Run the Next.js application
CMD ["bun","--bun","run","start"]
