import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsOptional,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateConversationDto {
  @ApiPropertyOptional({
    description: 'The ID of the agent for this conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  agentId?: string;

  @ApiProperty({
    description: 'The title of the conversation',
    example: 'FastAPI Learning',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;
}
