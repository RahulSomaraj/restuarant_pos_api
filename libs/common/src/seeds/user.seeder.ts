import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

export interface SeedUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

@Injectable()
export class UserSeeder {
  private readonly users: SeedUser[] = [
    // Admin Users
    {
      email: 'admin@restaurant.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
    {
      email: 'superadmin@restaurant.com',
      password: 'superadmin123',
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.ADMIN,
    },

    // Staff Users
    {
      email: 'manager@restaurant.com',
      password: 'manager123',
      firstName: 'John',
      lastName: 'Manager',
      role: UserRole.STAFF,
    },
    {
      email: 'chef@restaurant.com',
      password: 'chef123',
      firstName: 'Maria',
      lastName: 'Chef',
      role: UserRole.STAFF,
    },
    {
      email: 'waiter@restaurant.com',
      password: 'waiter123',
      firstName: 'Alex',
      lastName: 'Waiter',
      role: UserRole.STAFF,
    },
    {
      email: 'cashier@restaurant.com',
      password: 'cashier123',
      firstName: 'Sarah',
      lastName: 'Cashier',
      role: UserRole.STAFF,
    },

    // Customer Users
    {
      email: 'customer1@example.com',
      password: 'customer123',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: UserRole.CUSTOMER,
    },
    {
      email: 'customer2@example.com',
      password: 'customer123',
      firstName: 'Emily',
      lastName: 'Davis',
      role: UserRole.CUSTOMER,
    },
    {
      email: 'customer3@example.com',
      password: 'customer123',
      firstName: 'David',
      lastName: 'Wilson',
      role: UserRole.CUSTOMER,
    },
    {
      email: 'customer4@example.com',
      password: 'customer123',
      firstName: 'Lisa',
      lastName: 'Brown',
      role: UserRole.CUSTOMER,
    },
  ];

  async seedUsers(userRepository: any): Promise<void> {
    console.log('🌱 Starting user seeding...');

    for (const userData of this.users) {
      try {
        // Check if user already exists
        const existingUser = await userRepository.findOne({
          where: { email: userData.email },
        });

        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Create user
        const user = userRepository.create({
          email: userData.email,
          passwordHash: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
        });

        await userRepository.save(user);
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      } catch (error) {
        console.error(
          `❌ Failed to create user ${userData.email}:`,
          error.message,
        );
      }
    }

    console.log('🎉 User seeding completed!');
  }

  getUsers(): SeedUser[] {
    return this.users;
  }
}
