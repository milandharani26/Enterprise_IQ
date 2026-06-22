import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assistant } from './entities/assistant.entity';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';

@Injectable()
export class AssistantsService {
  constructor(
    @InjectRepository(Assistant)
    private assistantsRepository: Repository<Assistant>,
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

  async syncAssistants(): Promise<{ synced: number }> {
    const apiUrl =
      process.env.ENTERPRISE_AI_API_URL || 'http://localhost:8000/api/v1';

    // In a production environment, pass an authentication token (e.g., Service Account Token)
    const token = process.env.ENTERPRISE_AI_API_TOKEN || '';
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
      id: string;
      assistant_name: string;
      assistant_code: string;
      system_prompt: string;
      type: string;
      guardrails: unknown;
      tools: unknown;
      status: string;
    }>;
    let syncedCount = 0;

    for (const remoteAst of assistantsFromAI) {
      const assistantCode = remoteAst.assistant_code;
      const existing = await this.assistantsRepository.findOne({
        where: { assistant_code: assistantCode },
      });

      const configPayload = {
        system_prompt: remoteAst.system_prompt,
        type: remoteAst.type,
        guardrails: remoteAst.guardrails,
      };

      if (existing) {
        // Update
        existing.id = remoteAst.id; // Force the ID to sync if it drifted
        existing.name = remoteAst.assistant_name;
        existing.config = configPayload;
        existing.tools = remoteAst.tools;
        existing.is_active = remoteAst.status === 'enabled';
        await this.assistantsRepository.save(existing);
      } else {
        // Create
        const newAst = this.assistantsRepository.create({
          id: remoteAst.id, // Set the exact ID from enterpriseiq_ai
          name: remoteAst.assistant_name,
          assistant_code: assistantCode,
          config: configPayload,
          tools: remoteAst.tools,
          is_active: remoteAst.status === 'enabled',
        });
        await this.assistantsRepository.save(newAst);
      }
      syncedCount++;
    }

    return { synced: syncedCount };
  }
}
