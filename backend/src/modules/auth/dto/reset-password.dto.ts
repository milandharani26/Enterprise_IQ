import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(12, { message: 'Password must be at most 12 characters long' })
  newPassword: string;
}
