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
}
