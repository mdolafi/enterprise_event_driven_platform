# --------------------------------------------------------
# Stage 1: Build React Application
# --------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy React source files
COPY . .

# Grant execution permissions and build using npx
RUN chmod -R +x node_modules/.bin && npx react-scripts build

# --------------------------------------------------------
# Stage 2: Serve Production Assets via Nginx
# --------------------------------------------------------
FROM nginx:alpine

# Copy custom Nginx configuration for single-page app (SPA) routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static build artifacts from Stage 1
COPY --from=build /app/build /usr/share/nginx/html

# Expose HTTP web port
EXPOSE 80

# Start Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]