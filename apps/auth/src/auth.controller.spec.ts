import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  SignupResponseDto,
} from '../../../libs/common/src/dto/auth.dto';
import { UserRole } from '../../../libs/common/src/entities/user.entity';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    getHello: jest.fn(),
    signup: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    validatePassword: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      mockAuthService.getHello.mockReturnValue('Hello World!');
      expect(authController.getHello()).toBe('Hello World!');
      expect(mockAuthService.getHello).toHaveBeenCalled();
    });
  });

  describe('signup', () => {
    const validRegisterDto: RegisterDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    const expectedSignupResponse: SignupResponseDto = {
      message: 'User registered successfully',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CUSTOMER,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
      },
    };

    it('should successfully register a new user', async () => {
      mockAuthService.signup.mockResolvedValue(expectedSignupResponse);

      const result = await authController.signup(validRegisterDto);

      expect(result).toEqual(expectedSignupResponse);
      expect(mockAuthService.signup).toHaveBeenCalledWith(validRegisterDto);
    });

    it('should successfully register a user with admin role', async () => {
      const adminRegisterDto = { ...validRegisterDto, role: UserRole.ADMIN };
      const adminResponse = {
        ...expectedSignupResponse,
        user: { ...expectedSignupResponse.user, role: UserRole.ADMIN },
      };

      mockAuthService.signup.mockResolvedValue(adminResponse);

      const result = await authController.signup(adminRegisterDto);

      expect(result.user.role).toBe(UserRole.ADMIN);
      expect(mockAuthService.signup).toHaveBeenCalledWith(adminRegisterDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockAuthService.signup.mockRejectedValue(
        new ConflictException('Email already registered'),
      );

      await expect(authController.signup(validRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(authController.signup(validRegisterDto)).rejects.toThrow(
        'Email already registered',
      );
      expect(mockAuthService.signup).toHaveBeenCalledWith(validRegisterDto);
    });

    it('should throw BadRequestException for invalid data', async () => {
      mockAuthService.signup.mockRejectedValue(
        new BadRequestException('Invalid data provided'),
      );

      await expect(authController.signup(validRegisterDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(authController.signup(validRegisterDto)).rejects.toThrow(
        'Invalid data provided',
      );
      expect(mockAuthService.signup).toHaveBeenCalledWith(validRegisterDto);
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockAuthService.signup.mockRejectedValue(dbError);

      await expect(authController.signup(validRegisterDto)).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockAuthService.signup).toHaveBeenCalledWith(validRegisterDto);
    });
  });
});
