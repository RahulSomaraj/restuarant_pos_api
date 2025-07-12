import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

export interface MessageQueueConfig {
  url: string;
  queue: string;
}

@Injectable()
export class MessageQueueService implements OnModuleDestroy {
  private client: ClientProxy;

  constructor(private config: MessageQueueConfig) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [config.url],
        queue: config.queue,
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  async send(pattern: string, data: any): Promise<any> {
    return this.client.send(pattern, data).toPromise();
  }

  async emit(pattern: string, data: any): Promise<void> {
    return this.client.emit(pattern, data).toPromise();
  }

  getClient(): ClientProxy {
    return this.client;
  }
}
