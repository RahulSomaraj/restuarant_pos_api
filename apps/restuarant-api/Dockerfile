# Development Dockerfile for Restaurant API Service
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files (node_modules will be mounted as volume)
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Create node_modules directory (will be mounted from host)
RUN mkdir -p node_modules

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application in development mode
CMD ["npm", "run", "start:dev", "restuarant-api"] 