# Development Dockerfile for Auth Service
FROM node:24-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Create node_modules directory (will be mounted from host in dev)
RUN mkdir -p node_modules

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Copy startup script
COPY start-service.sh ./
RUN chmod +x start-service.sh

# Start the application in development mode with polling
CMD ["./start-service.sh", "auth"] 