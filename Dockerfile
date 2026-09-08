# ==============================================================================
# Yorkstead Starter — Production Dockerfile
# ==============================================================================
# Multi-stage build that produces a slim (~150MB) production image.
# Uses Next.js standalone output — no node_modules in the final image.
#
# Build:  docker build -t yorkstead-app .
# Run:    docker run -p 3000:3000 --env-file .env yorkstead-app
# ==============================================================================

# --- Stage 1: Install dependencies ---
FROM oven/bun:1.3.14-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

# --- Stage 2: Build the application ---
FROM oven/bun:1.3.14-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# --- Stage 3: Production runtime ---
FROM oven/bun:1.3.14-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Don't run as root in production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# The standalone build outputs a minimal server.js
CMD ["node", "server.js"]
