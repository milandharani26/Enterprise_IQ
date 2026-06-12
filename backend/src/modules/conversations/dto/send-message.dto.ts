import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'The content of the message',
    example: 'Explain FastAPI',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
