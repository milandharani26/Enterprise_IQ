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

interface FastApiChatResponse {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
}
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

  // Notice: organizationId is completely removed from the arguments!
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

    // 1. Create user message locally in NestJS
    const userMessage = this.messageRepository.create({
      conversation_id: id,
      role: MessageRole.USER,
      content: sendMessageDto.content,
    });
    await this.messageRepository.save(userMessage);

    // 2. Determine which agent/assistant to use
    const resolvedAgentId = sendMessageDto.agentId || conversation.agent_id;

    console.log(
      '[VERIFY] Backend received agentId in payload:',
      sendMessageDto.agentId,
    );
    console.log(
      '[VERIFY] Backend stored conversation.agent_id:',
      conversation.agent_id,
    );
    console.log('[VERIFY] Backend resolved agent_id for LLM:', resolvedAgentId);

    // Persist the new agent_id on the conversation record for future messages
    if (
      sendMessageDto.agentId &&
      sendMessageDto.agentId !== conversation.agent_id
    ) {
      await this.conversationRepository.update(id, {
        agent_id: sendMessageDto.agentId,
      });
    }

    // 3. Call your FastAPI Admin Backend to generate the response
    let assistantContent = 'AI response placeholder';
    try {
      const adminBackendUrl = process.env.ENTERPRISE_AI_API_URL;
      const serviceToken = process.env.ENTERPRISE_AI_API_TOKEN;

      const response = await fetch(`${adminBackendUrl}/conversations/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Passing the token containing the organization_id!
          Authorization: `Bearer ${serviceToken}`,
        },
        body: JSON.stringify({
          conversation_id: id,
          user_id: userId,
          agent_id: resolvedAgentId,
          // Notice: organization_id is no longer needed in the body
          content: sendMessageDto.content,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Admin FastAPI backend responded with status ${response.status}`,
        );
      }

      // FastAPI returns the `MessageResponseSchema` which contains the AI `content`
      // FastAPI returns the `MessageResponseSchema` which contains the AI `content`
      const data = (await response.json()) as FastApiChatResponse;
      assistantContent = data.content; // 👈 No more unsafe member access error!
    } catch (error) {
      console.error('Error communicating with Admin FastAPI Backend:', error);
      assistantContent = 'Sorry, the AI engine is currently unavailable.';
    }

    // 4. Create assistant message locally in NestJS using the AI response
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
