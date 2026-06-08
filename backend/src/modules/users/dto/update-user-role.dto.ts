import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
