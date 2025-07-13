import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthModule } from '../src/auth.module';
import { User, UserRole } from '../../../libs/common/src/entities/user.entity';
import { RegisterDto } from '../../../libs/common/src/dto/auth.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/signup (POST)', () => {
    const validSignupData: RegisterDto = {
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

    describe('Success cases', () => {
      it('should register a new user successfully', async () => {
        mockUserRepository.findOne.mockResolvedValue(null);
        mockUserRepository.create.mockReturnValue(mockUser);
        mockUserRepository.save.mockResolvedValue(mockUser);

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(validSignupData)
          .expect(201);

        expect(response.body).toHaveProperty(
          'message',
          'User registered successfully',
        );
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('email', 'test@example.com');
        expect(response.body.user).toHaveProperty('firstName', 'John');
        expect(response.body.user).toHaveProperty('lastName', 'Doe');
        expect(response.body.user).toHaveProperty('role', 'customer');
        expect(response.body.user).toHaveProperty('createdAt');
        expect(response.body.user).not.toHaveProperty('passwordHash');
      });

      it('should register a user with admin role', async () => {
        const adminSignupData = { ...validSignupData, role: UserRole.ADMIN };
        const adminUser = { ...mockUser, role: UserRole.ADMIN };

        mockUserRepository.findOne.mockResolvedValue(null);
        mockUserRepository.create.mockReturnValue(adminUser);
        mockUserRepository.save.mockResolvedValue(adminUser);

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(adminSignupData)
          .expect(201);

        expect(response.body.user.role).toBe('admin');
      });

      it('should normalize email to lowercase', async () => {
        const signupDataWithUppercaseEmail = {
          ...validSignupData,
          email: 'TEST@EXAMPLE.COM',
        };

        mockUserRepository.findOne.mockResolvedValue(null);
        mockUserRepository.create.mockReturnValue(mockUser);
        mockUserRepository.save.mockResolvedValue(mockUser);

        await request(app.getHttpServer())
          .post('/signup')
          .send(signupDataWithUppercaseEmail)
          .expect(201);

        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
        });
      });
    });

    describe('Validation errors', () => {
      it('should reject invalid email format', async () => {
        const invalidEmailData = { ...validSignupData, email: 'invalid-email' };

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(invalidEmailData)
          .expect(400);

        expect(response.body.message).toContain(
          'Please provide a valid email address',
        );
      });

      it('should reject weak password', async () => {
        const weakPasswordData = { ...validSignupData, password: 'weak' };

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(weakPasswordData)
          .expect(400);

        expect(response.body.message).toContain(
          'Password must be at least 8 characters long',
        );
      });

      it('should reject password without special characters', async () => {
        const noSpecialCharPassword = {
          ...validSignupData,
          password: 'SecurePass123',
        };

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(noSpecialCharPassword)
          .expect(400);

        expect(response.body.message).toContain(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        );
      });

      it('should reject short first name', async () => {
        const shortFirstNameData = { ...validSignupData, firstName: 'J' };

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(shortFirstNameData)
          .expect(400);

        expect(response.body.message).toContain(
          'First name must be at least 2 characters long',
        );
      });

      it('should reject first name with invalid characters', async () => {
        const invalidFirstNameData = {
          ...validSignupData,
          firstName: 'John123',
        };

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(invalidFirstNameData)
          .expect(400);

        expect(response.body.message).toContain(
          'First name can only contain letters, spaces, hyphens, and apostrophes',
        );
      });

      it('should reject invalid role', async () => {
        const invalidRoleData = { ...validSignupData, role: 'invalid-role' };

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(invalidRoleData)
          .expect(400);

        expect(response.body.message).toContain(
          'Role must be one of: customer, admin, staff',
        );
      });

      it('should reject missing required fields', async () => {
        const missingFieldsData = { email: 'test@example.com' };

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(missingFieldsData)
          .expect(400);

        expect(response.body.message).toContain('password should not be empty');
        expect(response.body.message).toContain(
          'firstName should not be empty',
        );
        expect(response.body.message).toContain('lastName should not be empty');
      });
    });

    describe('Business logic errors', () => {
      it('should reject duplicate email', async () => {
        mockUserRepository.findOne.mockResolvedValue(mockUser);

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(validSignupData)
          .expect(409);

        expect(response.body.message).toBe('Email already registered');
        expect(mockUserRepository.create).not.toHaveBeenCalled();
        expect(mockUserRepository.save).not.toHaveBeenCalled();
      });

      it('should handle database errors gracefully', async () => {
        const dbError = new Error('Database connection failed');
        mockUserRepository.findOne.mockResolvedValue(null);
        mockUserRepository.create.mockReturnValue(mockUser);
        mockUserRepository.save.mockRejectedValue(dbError);

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(validSignupData)
          .expect(400);

        expect(response.body.message).toBe(
          'Registration failed. Please try again.',
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle empty strings in names', async () => {
        const emptyNameData = {
          ...validSignupData,
          firstName: '   ',
          lastName: '   ',
        };

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(emptyNameData)
          .expect(400);

        expect(response.body.message).toContain(
          'First name must be at least 2 characters long',
        );
        expect(response.body.message).toContain(
          'Last name must be at least 2 characters long',
        );
      });

      it('should handle very long names', async () => {
        const longNameData = {
          ...validSignupData,
          firstName: 'A'.repeat(51),
          lastName: 'B'.repeat(51),
        };

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(longNameData)
          .expect(400);

        expect(response.body.message).toContain(
          'First name cannot exceed 50 characters',
        );
        expect(response.body.message).toContain(
          'Last name cannot exceed 50 characters',
        );
      });

      it('should handle very long password', async () => {
        const longPasswordData = {
          ...validSignupData,
          password: 'A'.repeat(129),
        };

        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(longPasswordData)
          .expect(400);

        expect(response.body.message).toContain(
          'Password cannot exceed 128 characters',
        );
      });
    });
  });

  describe('/ (GET)', () => {
    it('should return hello message', async () => {
      const response = await request(app.getHttpServer()).get('/').expect(200);

      expect(response.text).toBe('Hello World!');
    });
  });
});
