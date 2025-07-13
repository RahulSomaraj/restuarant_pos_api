import {
  Injectable,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '@app/common/entities/user.entity';
import {
  RegisterDto,
  SignupResponseDto,
  LoginDto,
  AuthResponseDto,
} from '@app/common/dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @MessagePattern('user.signup')
  async handleSignup(
    @Payload() registerDto: RegisterDto,
  ): Promise<SignupResponseDto> {
    return this.signup(registerDto);
  }

  @MessagePattern('user.login')
  async handleLogin(@Payload() loginDto: LoginDto): Promise<AuthResponseDto> {
    // TODO: Implement real login logic
    // For now, return a mock response
    return {
      accessToken: 'mock-jwt-token',
      user: {
        id: 'mock-user-id',
        email: loginDto.email,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CUSTOMER,
      },
    };
  }

  @MessagePattern('user.me')
  async handleMe(@Payload() userId: string): Promise<AuthResponseDto> {
    // TODO: Implement real user lookup logic
    return {
      accessToken: 'mock-jwt-token',
      user: {
        id: userId,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CUSTOMER,
      },
    };
  }

  @MessagePattern('user.logout')
  async handleLogout(@Payload() userId: string): Promise<{ message: string }> {
    // TODO: Implement real logout logic
    return { message: `User ${userId} logged out (mock)` };
  }

  @MessagePattern('user.refresh')
  async handleRefresh(
    @Payload() refreshToken: string,
  ): Promise<AuthResponseDto> {
    // TODO: Implement real refresh logic
    return {
      accessToken: 'mock-refreshed-jwt-token',
      user: {
        id: 'mock-user-id',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CUSTOMER,
      },
    };
  }

  async signup(registerDto: RegisterDto): Promise<SignupResponseDto> {
    const {
      email,
      password,
      firstName,
      lastName,
      role = UserRole.CUSTOMER,
    } = registerDto;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    this.logger.log(
      `Attempting to register user with email: ${normalizedEmail}`,
    );
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: normalizedEmail },
      });
      if (existingUser) {
        this.logger.warn(
          `Registration failed: Email ${normalizedEmail} already exists`,
        );
        throw new ConflictException('Email already registered');
      }
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      const newUser = this.userRepository.create({
        email: normalizedEmail,
        passwordHash,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        role,
      });
      const savedUser = await this.userRepository.save(newUser);
      this.logger.log(`User registered successfully: ${savedUser.id}`);
      const { passwordHash: _, ...userWithoutPassword } = savedUser;
      return {
        message: 'User registered successfully',
        user: {
          id: userWithoutPassword.id,
          email: userWithoutPassword.email,
          firstName: userWithoutPassword.firstName || '',
          lastName: userWithoutPassword.lastName || '',
          role: userWithoutPassword.role,
          createdAt: userWithoutPassword.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`, error.stack);
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === '23505') {
        throw new ConflictException('Email already registered');
      }
      if (error.code && error.code.startsWith('23')) {
        throw new BadRequestException('Invalid data provided');
      }
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
