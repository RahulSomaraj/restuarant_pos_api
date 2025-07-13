import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';

@Injectable()
export class GatewayService {
  private readonly services = {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
      name: 'Auth Service',
      description: 'Authentication and Authorization',
    },
    restaurant: {
      url:
        process.env.RESTAURANT_SERVICE_URL ||
        'http://restaurant-api-service:3002',
      name: 'Restaurant Service',
      description: 'Restaurant Management API',
    },
  };

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      version: '1.0.0',
      services: this.services,
    };
  }

  getServices() {
    return {
      gateway: {
        name: 'API Gateway',
        description: 'Unified entry point for all services',
        url: 'http://localhost:3000',
        endpoints: {
          health: '/health',
          services: '/services',
          auth: '/auth/*',
          restaurant: '/restaurant/*',
          docs: '/docs',
        },
      },
      ...this.services,
    };
  }

  async proxyRequest(req: Request, res: Response, serviceName: string) {
    try {
      const service = this.services[serviceName];
      if (!service) {
        throw new HttpException(
          `Service ${serviceName} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Extract the path after the service name
      const servicePath = req.url.replace(`/${serviceName}`, '');
      const targetUrl = `${service.url}${servicePath}`;

      // Prepare headers
      const headers = {
        ...req.headers,
        host: new URL(service.url).host,
      };

      // Make the request to the target service
      const response = await axios({
        method: req.method as any,
        url: targetUrl,
        headers,
        data: req.body,
        params: req.query,
        responseType: 'stream',
      });

      // Forward the response
      res.status(response.status);
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      response.data.pipe(res);
    } catch (error) {
      if (error.response) {
        // Forward error response from target service
        res.status(error.response.status);
        res.json(error.response.data);
      } else {
        // Handle gateway errors
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Gateway Error',
          message: error.message,
          service: serviceName,
        });
      }
    }
  }
}
