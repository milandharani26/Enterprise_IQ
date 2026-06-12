import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    // Log it so you can test without real SMTP!
    this.logger.log(`\n\n[PASSWORD RESET LINK FOR ${to}]\n${resetLink}\n\n`);

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click this link to reset your password: ${resetLink}`,
        html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
      });
      this.logger.log(`Reset email successfully sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to} (Check your SMTP settings in .env)`,
        error,
      );
    }
  }
}
