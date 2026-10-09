FROM node:20-alpine

WORKDIR /app

# Copy package files first for caching
COPY backend/package*.json ./backend/

# Install production dependencies inside container
RUN cd backend && npm install --production

# Copy backend source code and configuration
COPY backend/ ./backend/
COPY .env ./
COPY openapi.yaml ./

# Changed from 8000 to 8001 for Submitter service
EXPOSE 8003

CMD ["node", "backend/server.js"]