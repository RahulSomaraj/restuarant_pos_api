import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User, UserRole } from '../../../libs/common/src/entities/user.entity';
import {
  RegisterDto,
  SignupResponseDto,
} from '../../../libs/common/src/dto/auth.dto';
import { ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(service.getHello()).toBe('Hello World!');
    });
  });

  describe('signup', () => {
    const validRegisterDto: RegisterDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    const mockUser: User = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      passwordHash: 'hashedPassword123',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
      updatedAt: new Date('2023-01-01T00:00:00.000Z'),
    };

    const expectedResponse: SignupResponseDto = {
      message: 'User registered successfully',
      user: {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
      },
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
    });

    it('should successfully register a new user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.signup(validRegisterDto);

      expect(result).toEqual(expectedResponse);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 12);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CUSTOMER,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should normalize email to lowercase', async () => {
      const registerDtoWithUppercaseEmail = {
        ...validRegisterDto,
        email: 'TEST@EXAMPLE.COM',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.signup(registerDtoWithUppercaseEmail);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CUSTOMER,
      });
    });

    it('should trim whitespace from names', async () => {
      const registerDtoWithWhitespace = {
        ...validRegisterDto,
        firstName: '  John  ',
        lastName: '  Doe  ',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.signup(registerDtoWithWhitespace);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CUSTOMER,
      });
    });

    it('should register user with custom role', async () => {
      const registerDtoWithRole = {
        ...validRegisterDto,
        role: UserRole.ADMIN,
      };

      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(adminUser);
      mockUserRepository.save.mockResolvedValue(adminUser);

      const result = await service.signup(registerDtoWithRole);

      expect(result.user.role).toBe(UserRole.ADMIN);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.ADMIN,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.signup(validRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.signup(validRegisterDto)).rejects.toThrow(
        'Email already registered',
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle PostgreSQL unique constraint violation', async () => {
      const dbError = new Error('Duplicate key');
      dbError.code = '23505';

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockRejectedValue(dbError);

      await expect(service.signup(validRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.signup(validRegisterDto)).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should handle other database errors', async () => {
      const dbError = new Error('Database error');
      dbError.code = '23514'; // Check constraint violation

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockRejectedValue(dbError);

      await expect(service.signup(validRegisterDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.signup(validRegisterDto)).rejects.toThrow(
        'Invalid data provided',
      );
    });

    it('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error');

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockRejectedValue(unexpectedError);

      await expect(service.signup(validRegisterDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.signup(validRegisterDto)).rejects.toThrow(
        'Registration failed. Please try again.',
      );
    });

    it('should handle bcrypt hashing errors', async () => {
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing failed'));

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.signup(validRegisterDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.signup(validRegisterDto)).rejects.toThrow(
        'Registration failed. Please try again.',
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email (case insensitive)', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as User;
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('TEST@EXAMPLE.COM');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as User;
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('1');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const mockUser = { passwordHash: 'hashedPassword' } as User;
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(
        mockUser,
        'correctPassword',
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'correctPassword',
        'hashedPassword',
      );
    });

    it('should return false for invalid password', async () => {
      const mockUser = { passwordHash: 'hashedPassword' } as User;
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(mockUser, 'wrongPassword');

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        'hashedPassword',
      );
    });
  });
});
