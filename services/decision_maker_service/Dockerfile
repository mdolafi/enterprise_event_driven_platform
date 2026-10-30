# Stage 1: Base image
FROM node:20-alpine AS base
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Stage 3: Production runtime
FROM base AS release
ENV NODE_ENV=production
COPY --from=dependencies /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/
COPY .env ./
COPY openapi.yaml ./

USER node
# Expose microservice port
EXPOSE 8003

# Start server entrypoint
CMD ["node", "backend/server.js"]