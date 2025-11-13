# Production-ready Dockerfile for Fastify API
# Multi-stage build for optimized image size

# TODO: This Dockerfile needs adjustments for monorepo workspace dependencies.
# Current issues:
# - Production dependencies install failing in multi-stage build
# - Workspace package resolution in production stage needs refinement
# For now, use Railway's Node.js auto-detection (recommended) which handles monorepos better.
# Docker is optional - Railway doesn't require it.

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json tsconfig.base.json ./

# Copy config for packages build scripts
COPY config ./config

# Copy shared packages
COPY packages ./packages

# Copy API package
COPY apps/api ./apps/api

# Install dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm --filter @repo/api db:generate

# Build shared packages
RUN pnpm --filter '@repo/packages-*' build

# Build API
RUN pnpm --filter @repo/api build

# Stage 2: Production stage
FROM node:20-alpine AS runner

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apiuser

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY --chown=apiuser:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=apiuser:nodejs turbo.json ./

# Copy built shared packages from builder
COPY --from=builder --chown=apiuser:nodejs /app/packages/types/package.json ./packages/types/
COPY --from=builder --chown=apiuser:nodejs /app/packages/types/dist ./packages/types/dist
COPY --from=builder --chown=apiuser:nodejs /app/packages/utils/package.json ./packages/utils/
COPY --from=builder --chown=apiuser:nodejs /app/packages/utils/dist ./packages/utils/dist

# Copy built API
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/package.json ./apps/api/
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/prisma ./apps/api/prisma

# Install production dependencies (this also generates Prisma Client)
RUN pnpm install --frozen-lockfile --prod --filter @repo/api

# Generate Prisma Client for production
RUN pnpm --filter @repo/api db:generate

# Switch to non-root user
USER apiuser

# Expose port (Railway auto-detects from env.PORT)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the API
CMD ["node", "apps/api/dist/src/main.js"]
