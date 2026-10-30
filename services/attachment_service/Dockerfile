FROM node:20-alpine AS base
WORKDIR /app

FROM base AS dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

FROM base AS release
ENV NODE_ENV=production
COPY --from=dependencies /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/
COPY .env ./
COPY openapi.yaml ./

USER node
EXPOSE 8006
CMD ["node", "backend/server.js"]