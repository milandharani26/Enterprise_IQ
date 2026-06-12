import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RenameConversationDto {
  @ApiProperty({
    description: 'The new title of the conversation',
    example: 'NestJS Discussion',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;
}
