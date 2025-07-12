import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSeeder } from './user.seeder';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userSeeder: UserSeeder,
  ) {}

  async seedAll(): Promise<void> {
    console.log('🚀 Starting database seeding...');

    try {
      // Seed users
      await this.userSeeder.seedUsers(this.userRepository);

      console.log('✅ All seeds completed successfully!');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  async seedUsers(): Promise<void> {
    await this.userSeeder.seedUsers(this.userRepository);
  }
}
