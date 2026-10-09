# Use official lightweight Node.js 20 LTS image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first to leverage Docker layer caching for npm install
COPY backend/package*.json ./backend/

# Install production dependencies inside container
RUN cd backend && npm install --production

# Copy the rest of backend source code and configuration files
COPY backend/ ./backend/
COPY .env ./
COPY openapi.yaml ./

# Expose microservice port
EXPOSE 8007

# Run Node.js server entrypoint
CMD ["node", "backend/server.js"]