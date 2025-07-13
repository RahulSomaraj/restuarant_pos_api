import {
  Controller,
  Get,
  All,
  Req,
  Res,
  Inject,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GatewayService } from './gateway.service';
import { ClientProxy } from '@nestjs/microservices';
import {
  RegisterDto,
  SignupResponseDto,
  LoginDto,
  AuthResponseDto,
} from '../../../libs/common/src/dto/auth.dto';
import { firstValueFrom } from 'rxjs';

@ApiTags('gateway')
@Controller()
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('auth/signup')
  @ApiOperation({ summary: 'Register a new user (via message broker)' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: SignupResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation or business error' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async signupViaBroker(@Body() registerDto: RegisterDto) {
    try {
      const result = await firstValueFrom(
        this.authClient.send('user.signup', registerDto),
      );
      return result;
    } catch (error) {
      if (error?.status === 409) {
        throw new HttpException(
          error.message || 'Email already registered',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        error.message || 'Registration failed',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Login a user (via message broker)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'User logged in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials or error' })
  async loginViaBroker(@Body() loginDto: LoginDto) {
    try {
      const result = await firstValueFrom(
        this.authClient.send('user.login', loginDto),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Login failed',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('auth/me')
  @ApiOperation({ summary: 'Get current user info (via message broker)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { userId: { type: 'string', example: 'mock-user-id' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Current user info',
    type: AuthResponseDto,
  })
  async meViaBroker(@Body('userId') userId: string) {
    try {
      const result = await firstValueFrom(
        this.authClient.send('user.me', userId),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get user info',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Logout a user (via message broker)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { userId: { type: 'string', example: 'mock-user-id' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out',
    schema: { type: 'object', properties: { message: { type: 'string' } } },
  })
  async logoutViaBroker(@Body('userId') userId: string) {
    try {
      const result = await firstValueFrom(
        this.authClient.send('user.logout', userId),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Logout failed',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('auth/refresh')
  @ApiOperation({ summary: 'Refresh JWT token (via message broker)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'mock-refresh-token' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed',
    type: AuthResponseDto,
  })
  async refreshViaBroker(@Body('refreshToken') refreshToken: string) {
    try {
      const result = await firstValueFrom(
        this.authClient.send('user.refresh', refreshToken),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Token refresh failed',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Gateway health status' })
  @ApiResponse({ status: 200, description: 'Health check response' })
  getHealth() {
    return this.gatewayService.getHealth();
  }

  @Get('services')
  @ApiOperation({ summary: 'Get available services' })
  @ApiResponse({ status: 200, description: 'List of available services' })
  getServices() {
    return this.gatewayService.getServices();
  }
}
