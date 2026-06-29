import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class SendMessageDto {
  @ApiPropertyOptional({
    description:
      'The ID of the agent/assistant to handle this message. If omitted, uses the conversation default.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  agentId?: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'Explain FastAPI',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
