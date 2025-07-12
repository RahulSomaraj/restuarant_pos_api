import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { User } from './libs/common/src/entities/user.entity';
import { UserSeeder } from './libs/common/src/seeds/user.seeder';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: configService.get('DB_PORT') || 5432,
        username: configService.get('DB_USERNAME') || 'restaurant_user',
        password: configService.get('DB_PASSWORD') || 'restaurant_password',
        database: configService.get('DB_NAME') || 'restaurant_db',
        entities: [User],
        synchronize: true, // Be careful with this in production
        logging: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserSeeder],
})
class SeederModule {}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  const app = await NestFactory.createApplicationContext(SeederModule);

  try {
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const userSeeder = app.get(UserSeeder);

    await userSeeder.seedUsers(userRepository);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run the seeder
seedDatabase();
