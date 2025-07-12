# Restaurant API Docker Setup

This repository contains a microservices-based restaurant API with Docker containerization for all services.

## Services Overview

1. **Auth Service** (Port 3001) - User authentication and authorization
2. **Restaurant API Service** (Port 3002) - Main restaurant API endpoints
3. **PostgreSQL Database** (Port 5432) - Shared database for all services
4. **RabbitMQ Message Queue** (Port 5672) - Inter-service communication

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)

## Quick Start

1. **Clone the repository and navigate to the project directory**

2. **Copy the environment file:**

   ```bash
   cp env.example .env
   ```

3. **Edit the `.env` file with your configuration:**
   - Update database credentials
   - Configure JWT secret

4. **Build and start all services:**

   ```bash
   docker-compose up --build
   ```

5. **Access the services:**
   - Auth Service: http://localhost:3001
   - Restaurant API: http://localhost:3002
   - Database: localhost:5432
   - RabbitMQ Management: http://localhost:15672 (admin/admin123)
   - Auth API Documentation: http://localhost:3001/docs
   - Restaurant API Documentation: http://localhost:3002/docs

## Docker Commands

### Using npm scripts (recommended)

```bash
# Start services
npm run docker:up

# Start services with rebuild
npm run docker:up:build

# Stop services
npm run docker:down

# Stop services and remove volumes
npm run docker:down:volumes

# Build services
npm run docker:build

# View logs
npm run docker:logs

# Clean up entire Docker system (Linux/Mac)
npm run docker:cleanup

# Clean up entire Docker system (Windows)
npm run docker:cleanup:win
```

### Direct docker-compose commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (database data)
docker-compose down -v

# Rebuild specific service
docker-compose build auth-service

# View logs
docker-compose logs -f auth-service

# Access service shell
docker-compose exec auth-service sh
```

### Complete Docker System Cleanup

For a complete cleanup of your Docker system (removes all containers, images, volumes, and build cache):

**Linux/Mac:**

```bash
./cleanup-docker.sh
# or
npm run docker:cleanup
```

**Windows:**

```bash
cleanup-docker.bat
# or
npm run docker:cleanup:win
```

## Service Dependencies

- All services depend on PostgreSQL database
- Restaurant API Service depends on Auth Service
- Services communicate via the `restaurant-network` bridge network

## Environment Variables

### Required Variables

- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `RABBITMQ_USER` - RabbitMQ username
- `RABBITMQ_PASSWORD` - RabbitMQ password

### Optional Variables

- `NODE_ENV` - Node environment (default: production)
- `JWT_EXPIRES_IN` - JWT expiration time (default: 1d)

## Database

The PostgreSQL database is configured with:

- Persistent volume storage (`postgres_data`)
- Health checks
- Default database: `restaurant_db`
- No initialization script (database schema will be managed by your application)

## Message Queue (RabbitMQ)

RabbitMQ is configured for inter-service communication:

- **AMQP Port**: 5672
- **Management UI**: http://localhost:15672
- **Default Credentials**: admin/admin123
- **Persistent Storage**: `rabbitmq_data` volume
- **Health Checks**: Automatic monitoring

### Features:

- Reliable message delivery
- Message persistence
- Dead letter queues
- Message routing
- Queue monitoring via web UI

## API Documentation (Swagger)

Both services include interactive API documentation powered by Swagger:

- **Auth Service**: http://localhost:3001/docs
- **Restaurant API**: http://localhost:3002/docs

### Features:

- Interactive API testing
- Request/response schemas
- Authentication documentation
- Example requests and responses

## Health Checks

All services include health check endpoints:

- Auth Service: `GET /health`
- Restaurant API: `GET /health`

## Development

For local development without Docker:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up PostgreSQL database

3. Configure environment variables

4. Run services individually:
   ```bash
   npm run start:dev auth
   npm run start:dev restuarant-api
   ```

## Database Seeding

The project includes a database seeder that creates 10 default users with different roles:

### Run Seeder
```bash
# Local development
npm run seed:users

# With Docker
npm run seed:users:docker
```

### Seeded Users
- **2 Admin users** - Full system access
- **4 Staff users** - Restaurant staff access  
- **4 Customer users** - Customer access

See [SEEDED_USERS.md](./SEEDED_USERS.md) for complete user details and credentials.

## Troubleshooting

### Service won't start

- Check if PostgreSQL is healthy: `docker-compose ps`
- View service logs: `docker-compose logs <service-name>`
- Verify environment variables are set correctly

### Database connection issues

- Ensure PostgreSQL container is running: `docker-compose ps postgres`
- Check database logs: `docker-compose logs postgres`
- Verify DATABASE_URL format in environment variables

### Port conflicts

- Check if ports 3001-3002 and 5432 are available
- Modify port mappings in `docker-compose.yml` if needed

## Production Deployment

For production deployment:

1. Use proper secrets management
2. Configure proper SSL/TLS certificates
3. Set up reverse proxy (nginx/traefik)
4. Configure proper logging and monitoring
5. Use production-grade PostgreSQL setup
6. Implement proper backup strategies

## Contributing

1. Create feature branch
2. Make changes
3. Test with Docker setup
4. Submit pull request

## License

[Your License Here]
