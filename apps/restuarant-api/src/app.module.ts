import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MenuItem, Order, User } from '@app/common/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'postgres',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || 'restaurant_user',
      password: process.env.POSTGRES_PASSWORD || 'restaurant_password',
      database: process.env.POSTGRES_DB || 'restaurant_db',
      entities: [MenuItem, Order, User],
      synchronize: true, // Set to false in production
    }),
    TypeOrmModule.forFeature([MenuItem, Order]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
