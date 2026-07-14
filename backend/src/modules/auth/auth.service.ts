import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AuthDto, SignupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async signUp(signupDto: SignupDto) {
    const userExists = await this.usersService.findByEmail(signupDto.email);
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.hashData(signupDto.password);
    const newUser = await this.usersService.create({
      email: signupDto.email,
      password: hashedPassword,
    });

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    return tokens;
  }

  async signIn(authDto: AuthDto) {
    const user = await this.usersService.findByEmail(authDto.email);
    if (!user || !user.password) {
      throw new BadRequestException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      authDto.password,
      user.password,
    );
    if (!passwordMatches) {
      throw new BadRequestException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async googleLogin(googleUser: { email?: string }) {
    if (!googleUser || !googleUser.email) {
      throw new UnauthorizedException('No user from google');
    }

    const email = googleUser.email;
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Create a new user without a password since they authenticated via Google
      user = await this.usersService.create({ email });
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return {
        message: 'If that email is in our system, a reset link has been sent.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await this.redis.set(
      `reset_token:${hashedResetToken}`,
      user.id,
      'EX',
      3600,
    );

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
    return {
      message: 'If that email is in our system, a reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const userId = await this.redis.get(`reset_token:${hashedResetToken}`);
    if (!userId) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await this.hashData(newPassword);

    await this.usersService.update(user.id, {
      password: hashedPassword,
    });

    await this.redis.del(`reset_token:${hashedResetToken}`);

    return { message: 'Password has been successfully reset' };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, { hashedRefreshToken });
  }

  async logout(userId: string) {
    await this.usersService.update(userId, { hashedRefreshToken: null });
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
