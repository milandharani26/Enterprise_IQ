import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(user: Partial<User>): Promise<User> {
    if (!user.role_id && !user.role) {
      const employeeRole = await this.rolesRepository.findOne({
        where: { role_code: 'EMPLOYEE' },
      });
      if (employeeRole) {
        user.role = employeeRole;
      }
    }
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: { role: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: { role: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: { role: true },
    });
  }

  async update(id: string, attrs: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, attrs);
    return this.findById(id);
  }

  async updateRole(id: string, roleId: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    user.role = role;
    return this.usersRepository.save(user);
  }
}
