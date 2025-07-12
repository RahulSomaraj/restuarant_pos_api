import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../libs/common/src/entities/user.entity';
import { RegisterDto } from '../../../libs/common/src/dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async signup(registerDto: RegisterDto): Promise<Omit<User, 'passwordHash'>> {
    const { email, password, firstName, lastName } = registerDto;
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
    });
    const saved = await this.userRepository.save(user);
    // Exclude passwordHash from returned user
    const { passwordHash: _, ...userWithoutPassword } = saved;
    return userWithoutPassword;
  }
}
