import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as morgan from 'morgan';
import { GatewayModule } from './gateway.module';
import * as cors from 'cors';
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

  // Comprehensive Swagger configuration for unified API documentation
  const config = new DocumentBuilder()
    .setTitle('Restaurant Management System - Unified API Gateway')
    .setDescription(
      'Unified API gateway for the Restaurant Management System. All services are accessible through this gateway. ' +
        'Auth Service (/auth/*) provides authentication and user management. ' +
        'Restaurant Service (/restaurant/*) provides menu management and order processing. ' +
        'Use the Authorize button to set your JWT token for authenticated endpoints.',
    )
    .setVersion('1.0.0')
    .addTag('gateway', 'API Gateway endpoints')
    .addTag('auth', 'Authentication and Authorization')
    .addTag('users', 'User management')
    .addTag('restaurant', 'Restaurant management')
    .addTag('menu', 'Menu management')
    .addTag('orders', 'Order processing')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Development Gateway')
    .addServer('http://gateway-service:3000', 'Docker Gateway')
    .build();

  // Create comprehensive Swagger document
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
    include: [GatewayModule],
  });

  // Enhanced Swagger UI setup
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list', // changed from 'none' to 'list'
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Restaurant Management System - Unified API',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
      .swagger-ui .info .description { font-size: 14px; line-height: 1.6; color: #555; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0; }
      .swagger-ui .opblock-tag { font-weight: bold; color: #2c3e50; }
      .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #61affe; }
      .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #49cc90; }
      .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #fca130; }
      .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #f93e3e; }
      .swagger-ui .authorization__btn { background: #2c3e50; border-color: #2c3e50; }
      .swagger-ui .authorization__btn:hover { background: #34495e; }
    `,
    customJs: `
      window.onload = function() {
        const storedAuthToken = localStorage.getItem('gateway_auth_token');
        if (storedAuthToken) {
          const bearerInput = document.querySelector('input[placeholder="Bearer token"]');
          if (bearerInput) {
            bearerInput.value = storedAuthToken;
          }
        }
        
        const authorizeBtn = document.querySelector('button[class*="authorize"]');
        if (authorizeBtn) {
          authorizeBtn.onclick = function() {
            const bearerInput = document.querySelector('input[placeholder="Bearer token"]');
            if (bearerInput) {
              const token = bearerInput.value;
              localStorage.setItem('gateway_auth_token', token);
            }
          };
        }
        
        const infoSection = document.querySelector('.swagger-ui .info');
        if (infoSection) {
          const serviceInfo = document.createElement('div');
          serviceInfo.innerHTML = '<div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #2c3e50;"><h4 style="margin: 0 0 10px 0; color: #2c3e50;">🚀 Service Endpoints</h4><div style="font-size: 12px; line-height: 1.4;"><strong>Auth Service:</strong> <a href="http://localhost:3001/docs" target="_blank">http://localhost:3001/docs</a><br><strong>Restaurant Service:</strong> <a href="http://localhost:3002/docs" target="_blank">http://localhost:3002/docs</a><br><strong>Gateway Health:</strong> <a href="http://localhost:3000/health" target="_blank">http://localhost:3000/health</a></div></div>';
          infoSection.appendChild(serviceInfo);
        }
      };
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
      documentation: {
        unified: 'http://localhost:3000/docs',
        auth: 'http://localhost:3001/docs',
        restaurant: 'http://localhost:3002/docs',
      },
    });
  });

  await app.listen(PORT, () => {
    Logger.log(`🚀 API Gateway Started at ${PORT}`);
    Logger.log(`📚 Unified API Documentation: http://localhost:${PORT}/docs`);
    Logger.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    Logger.log(`🔐 Auth Service: http://localhost:3001`);
    Logger.log(`🍽️ Restaurant Service: http://localhost:3002`);
    Logger.log(`🌐 Gateway Endpoints:`);
    Logger.log(`   - /auth/* -> Auth Service`);
    Logger.log(`   - /restaurant/* -> Restaurant Service`);
    Logger.log(`   - /docs -> Unified Swagger Documentation`);
    Logger.log(`   - /health -> Gateway Health Check`);
    Logger.log(`   - /services -> Available Services`);
  });
}

bootstrap().catch((error) => {
  Logger.error('Failed to start API Gateway:', error);
  process.exit(1);
});
