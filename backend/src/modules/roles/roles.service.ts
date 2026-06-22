import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Assistant } from '../assistants/entities/assistant.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Assistant)
    private assistantsRepository: Repository<Assistant>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existing = await this.rolesRepository.findOne({
      where: { role_code: createRoleDto.role_code },
    });
    if (existing) throw new ConflictException('Role code already exists');
    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  async findAll(): Promise<any[]> {
    const roles = await this.rolesRepository.find();
    const allAssistants = await this.assistantsRepository.find();
    const assistantsMap = new Map(allAssistants.map((a) => [a.id, a]));

    return roles.map((role) => {
      let resolvedAssistants: Assistant[] = [];
      if (role.role_code?.toLowerCase() === 'admin') {
        resolvedAssistants = allAssistants;
      } else {
        resolvedAssistants = (role.assistant_ids || [])
          .map((id) => assistantsMap.get(id))
          .filter((a): a is Assistant => Boolean(a));
      }
      return {
        ...role,
        assistant_ids: resolvedAssistants,
      };
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async findAssistantsByRole(id: string): Promise<Assistant[]> {
    const role = await this.findOne(id);
    if (role.role_code?.toLowerCase() === 'admin') {
      return this.assistantsRepository.find();
    }
    if (!role.assistant_ids || role.assistant_ids.length === 0) {
      return [];
    }
    return this.assistantsRepository.find({
      where: { id: In(role.assistant_ids) },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, updateRoleDto);
    return this.rolesRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepository.remove(role);
  }
}
