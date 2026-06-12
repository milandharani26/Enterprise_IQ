import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google for authentication.',
  })
  async googleAuth() {
    // Guard redirects to google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend after authentication.',
  })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.googleLogin(
      req.user as { email?: string },
    );
    this.setTokensInCookies(res, tokens);
    res.redirect('http://localhost:3000'); // Redirect to frontend/home
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Get('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens successfully refreshed.' })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing refresh token.',
  })
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as { id: string; refreshToken: string };
    const tokens = await this.authService.refreshTokens(
      user.id,
      user.refreshToken,
    );
    this.setTokensInCookies(res, tokens);
    return { success: true, message: 'Tokens refreshed successfully' };
  }

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully signed up.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., email already exists).',
  })
  async signup(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signUp(authDto);
    this.setTokensInCookies(res, tokens);
    return { success: true, message: 'Signed up successfully' };
  }

  @Public()
  @Post('signin')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({ status: 201, description: 'User successfully signed in.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async signin(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signIn(authDto);
    this.setTokensInCookies(res, tokens);
    return { success: true, message: 'Signed in successfully' };
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiResponse({
    status: 201,
    description: 'Password reset email sent (if user exists).',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 201, description: 'Password successfully reset.' })
  @ApiResponse({ status: 400, description: 'Bad Request or Invalid Token.' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as { id?: string; sub?: string };
    const userId = user?.id || user?.sub;
    if (userId) {
      await this.authService.logout(userId);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { success: true, message: 'Logged out successfully' };
  }

  private setTokensInCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
