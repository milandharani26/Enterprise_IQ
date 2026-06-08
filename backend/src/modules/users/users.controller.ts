import { Controller, Get, Patch, Param, Body, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { User } from './entities/user.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current logged in user' })
  async getUserFromToken(@Req() req: Request) {
    // req.user is set by the JwtStrategy
    const user = req.user as { id: string; email: string };
    const userId = user?.id;
    return await this.usersService.findById(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() body: Partial<User>) {
    return this.usersService.update(id, body);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  updateRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(id, updateUserRoleDto.roleId);
  }
}
