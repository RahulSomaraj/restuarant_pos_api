import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import morgan from 'morgan';
import { GatewayModule } from './gateway.module';
import cors from 'cors';
import helmet from 'helmet';

process.env.TZ = 'Asia/Kolkata';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

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
  const PORT = configService.get('PORT') || process.env.PORT || 3000;

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Restaurant Management System API Gateway')
    .setDescription(
      'Unified API Gateway for all Restaurant Management Services',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication and Authorization')
    .addTag('restaurant', 'Restaurant Management')
    .addTag('menu', 'Menu Management')
    .addTag('orders', 'Order Management')
    .addBearerAuth()
    .build();

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

  // Global error handling
  process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Promise Rejection:', reason);
    Logger.error('Promise:', promise);
  });

  process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  // Swagger setup
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Restaurant API Gateway Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #333; font-size: 24px; }
    `,
  });

  // Health check endpoint
  app.use('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      version: '1.0.0',
      services: {
        auth: 'http://localhost:3001',
        restaurant: 'http://localhost:3002',
      },
    });
  });

  await app.listen(PORT, () => {
    Logger.log(`🚀 API Gateway Started at ${PORT}`);
    Logger.log(`📚 Unified API Documentation: http://localhost:${PORT}/docs`);
    Logger.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    Logger.log(`🔐 Auth Service: http://localhost:3001`);
    Logger.log(`🍽️ Restaurant Service: http://localhost:3002`);
  });
}

bootstrap().catch((error) => {
  Logger.error('Failed to start API Gateway:', error);
  process.exit(1);
});
