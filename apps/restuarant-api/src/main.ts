import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import morgan from 'morgan';
import { AppModule } from './app.module';
import cors from 'cors';
import { IoAdapter } from '@nestjs/platform-socket.io';
import helmet from 'helmet';
import { join } from 'path';

process.env.TZ = 'Asia/Kolkata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  const PORT = configService.get('PORT') || process.env.PORT || 3002;

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Restaurant API')
    .setDescription('Restaurant Management System API')
    .setVersion('1.0')
    .addTag('restaurant')
    .addTag('menu')
    .addTag('orders')
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

  // Swagger setup with enhanced configuration
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Restaurant API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #333; font-size: 24px; }
    `,
    customJs: `
      window.onload = function() {
        const storedToken = localStorage.getItem('restaurant_api_token');
        if (storedToken) {
          const bearerInput = document.querySelector('input[placeholder="Bearer token"]');
          if (bearerInput) {
            bearerInput.value = storedToken;
          }
        }
        
        const authorizeBtn = document.querySelector('button[class*="authorize"]');
        if (authorizeBtn) {
          authorizeBtn.onclick = function() {
            const bearerInput = document.querySelector('input[placeholder="Bearer token"]');
            if (bearerInput) {
              localStorage.setItem('restaurant_api_token', bearerInput.value);
            }
          };
        }
      };
    `,
  });

  // Health check endpoint
  app.use('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'restaurant-api',
      version: '1.0.0',
    });
  });

  await app.listen(PORT, () => {
    Logger.log(`🚀 Restaurant API Server Started at ${PORT}`);
    Logger.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    Logger.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  });
}

bootstrap().catch((error) => {
  Logger.error('Failed to start Restaurant API:', error);
  process.exit(1);
});
