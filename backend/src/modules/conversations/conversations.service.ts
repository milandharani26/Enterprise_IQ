import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { ConversationMessage } from './entities/conversation-message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { RenameConversationDto } from './dto/rename-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageRole } from './enums/message-role.enum';
import { PaginationQueryDto, PaginatedResponseDto } from './dto/pagination.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationMessage)
    private readonly messageRepository: Repository<ConversationMessage>,
  ) {}

  async create(
    userId: string,
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      user_id: userId,
      agent_id: createConversationDto.agentId,
      title: createConversationDto.title,
    });

    return this.conversationRepository.save(conversation);
  }

  async findAll(
    userId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Conversation>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.conversationRepository.findAndCount({
      where: { user_id: userId },
      order: { updated_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(userId: string, id: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: {
        messages: true,
      },
      order: {
        messages: {
          created_at: 'ASC',
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    return conversation;
  }

  async sendMessage(
    userId: string,
    id: string,
    sendMessageDto: SendMessageDto,
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    // Create user message
    const userMessage = this.messageRepository.create({
      conversation_id: id,
      role: MessageRole.USER,
      content: sendMessageDto.content,
    });

    await this.messageRepository.save(userMessage);

    // Placeholder for AI response generation
    const assistantContent = 'AI response placeholder';

    // Create assistant message
    const assistantMessage = this.messageRepository.create({
      conversation_id: id,
      role: MessageRole.ASSISTANT,
      content: assistantContent,
    });

    await this.messageRepository.save(assistantMessage);

    // Update conversation timestamp
    conversation.updated_at = new Date();
    await this.conversationRepository.save(conversation);

    return {
      userMessage,
      assistantMessage,
    };
  }

  async rename(
    userId: string,
    id: string,
    renameConversationDto: RenameConversationDto,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    conversation.title = renameConversationDto.title;
    return this.conversationRepository.save(conversation);
  }

  async remove(userId: string, id: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    await this.conversationRepository.remove(conversation);
  }
}
