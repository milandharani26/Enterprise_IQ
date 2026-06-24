import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Assistant } from './entities/assistant.entity';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class AssistantsService {
  constructor(
    @InjectRepository(Assistant)
    private assistantsRepository: Repository<Assistant>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private configService: ConfigService,
  ) {}

  async create(createAssistantDto: CreateAssistantDto): Promise<Assistant> {
    const existing = await this.assistantsRepository.findOne({
      where: { assistant_code: createAssistantDto.assistant_code },
    });
    if (existing) throw new ConflictException('Assistant code already exists');
    const assistant = this.assistantsRepository.create(createAssistantDto);
    return this.assistantsRepository.save(assistant);
  }

  findAll(): Promise<Assistant[]> {
    return this.assistantsRepository.find();
  }

  async findOne(id: string): Promise<Assistant> {
    const assistant = await this.assistantsRepository.findOne({
      where: { id },
    });
    if (!assistant) throw new NotFoundException('Assistant not found');
    return assistant;
  }

  async update(
    id: string,
    updateAssistantDto: UpdateAssistantDto,
  ): Promise<Assistant> {
    const assistant = await this.findOne(id);
    Object.assign(assistant, updateAssistantDto);
    return this.assistantsRepository.save(assistant);
  }

  async remove(id: string): Promise<void> {
    const assistant = await this.findOne(id);
    await this.assistantsRepository.remove(assistant);
  }

  async syncAssistants(): Promise<{ added: string[]; deleted: string[] }> {
    const apiUrl = this.configService.get<string>(
      'ENTERPRISE_AI_API_URL',
      'http://localhost:8000/api/v1',
    );

    const token = this.configService.get<string>('ENTERPRISE_AI_API_TOKEN', '');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const payloadBuffer = Buffer.from(payloadBase64, 'base64');
          const payload = JSON.parse(payloadBuffer.toString('utf8')) as Record<
            string,
            unknown
          >;
          if (typeof payload.organization_id === 'string') {
            headers['X-Organization-Id'] = payload.organization_id;
          }
        }
      } catch (e) {
        console.warn('Failed to decode JWT for X-Organization-Id', e);
      }
    }

    const response = await fetch(`${apiUrl}/assistants?limit=100`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch assistants from Enterprise AI: ${response.statusText}`,
      );
    }

    const assistantsFromAI = (await response.json()) as Array<{
      assistant_id: string;
      assistant_name: string;
      assistant_code: string;
      system_prompt: string;
      type: string;
      guardrails: unknown;
      tools: unknown;
      status: string;
    }>;

    const localAssistants = await this.assistantsRepository.find();
    const localCodeSet = new Set(localAssistants.map((a) => a.assistant_code));
    const remoteCodeSet = new Set(
      assistantsFromAI.map((a) => a.assistant_code),
    );

    const toAdd = assistantsFromAI.filter(
      (a) => !localCodeSet.has(a.assistant_code),
    );
    const toDelete = localAssistants.filter(
      (a) => !remoteCodeSet.has(a.assistant_code),
    );
    const toUpdate = assistantsFromAI.filter((a) =>
      localCodeSet.has(a.assistant_code),
    );

    const added: string[] = [];
    const deleted: string[] = [];

    for (const remoteAst of toAdd) {
      const configPayload = {
        system_prompt: remoteAst.system_prompt,
        type: remoteAst.type,
        guardrails: remoteAst.guardrails,
      };

      const newAst = this.assistantsRepository.create({
        id: remoteAst.assistant_id,
        name: remoteAst.assistant_name,
        assistant_code: remoteAst.assistant_code,
        config: configPayload,
        tools: remoteAst.tools,
        is_active: remoteAst.status === 'enabled',
      });
      await this.assistantsRepository.save(newAst);
      added.push(remoteAst.assistant_name);

      const adminRole = await this.rolesRepository.findOne({
        where: { role_code: 'admin' },
      });
      if (adminRole) {
        adminRole.assistant_ids = [
          ...(adminRole.assistant_ids ?? []),
          remoteAst.assistant_id,
        ];
        await this.rolesRepository.save(adminRole);
      }
    }

    for (const remoteAst of toUpdate) {
      const configPayload = {
        system_prompt: remoteAst.system_prompt,
        type: remoteAst.type,
        guardrails: remoteAst.guardrails,
      };

      await this.assistantsRepository.update(
        { assistant_code: remoteAst.assistant_code },
        {
          id: remoteAst.assistant_id,
          name: remoteAst.assistant_name,
          config: configPayload,
          tools: remoteAst.tools,
          is_active: remoteAst.status === 'enabled',
        } as any,
      );
    }

    for (const assistant of toDelete) {
      const rolesWithAssistant = await this.rolesRepository.find();
      for (const role of rolesWithAssistant) {
        if (role.assistant_ids && role.assistant_ids.includes(assistant.id)) {
          role.assistant_ids = role.assistant_ids.filter(
            (id) => id !== assistant.id,
          );
          await this.rolesRepository.save(role);
        }
      }

      await this.assistantsRepository.delete(assistant.id);
      deleted.push(assistant.name);
    }

    return { added, deleted };
  }
}
