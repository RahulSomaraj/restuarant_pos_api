import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as morgan from 'morgan';
import { AuthModule } from './auth.module';
import * as cors from 'cors';
import { IoAdapter } from '@nestjs/platform-socket.io';
import helmet from 'helmet';
import { join } from 'path';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

process.env.TZ = 'Asia/Kolkata';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  // Security middleware
  app.use(helmet());
  app.use(morgan('tiny'));
  app.use(cors());

  // CORS configuration
  app.enableCors({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Get configuration service
  const configService = app.get<ConfigService>(ConfigService);
  const PORT = configService.get('PORT') || process.env.PORT || 3001;

  // Microservice for RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
      ],
      queue: 'auth_queue',
      queueOptions: { durable: false },
    },
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: false,
    }),
  );

  // WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Global error handling
  process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Promise Rejection:', reason);
    Logger.error('Promise:', promise);
  });

  process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  // Health check endpoint
  app.use('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-api',
      version: '1.0.0',
    });
  });

  await app.startAllMicroservices();
  await app.listen(PORT, () => {
    Logger.log(`🚀 Auth API Server Started at ${PORT}`);
    Logger.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    Logger.log(
      `📚 API Documentation available through Gateway: http://localhost:3000/docs`,
    );
    Logger.log(`📡 Auth microservice listening on RabbitMQ queue: auth_queue`);
  });
}

bootstrap().catch((error) => {
  Logger.error('Failed to start Auth API:', error);
  process.exit(1);
});
