import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { RenameConversationDto } from './dto/rename-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    sub?: string;
  };
}

@ApiTags('Conversations')
@ApiBearerAuth()
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  private getUserId(req: AuthenticatedRequest): string {
    // Attempt to extract user id from request
    // Assumes authentication middleware sets req.user
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return userId;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({
    status: 201,
    description: 'The conversation has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const userId = this.getUserId(req);
    return this.conversationsService.create(userId, createConversationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user conversations with pagination' })
  @ApiResponse({ status: 200, description: 'List of conversations.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    const userId = this.getUserId(req);
    return this.conversationsService.findAll(userId, paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation details and messages' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'The conversation details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = this.getUserId(req);
    return this.conversationsService.findOne(userId, id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message to a conversation' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 201,
    description: 'Messages returned (user and assistant).',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  sendMessage(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const userId = this.getUserId(req);
    return this.conversationsService.sendMessage(userId, id, sendMessageDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename a conversation' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'The conversation has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  rename(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() renameConversationDto: RenameConversationDto,
  ) {
    const userId = this.getUserId(req);
    return this.conversationsService.rename(userId, id, renameConversationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'The conversation has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = this.getUserId(req);
    return this.conversationsService.remove(userId, id);
  }
}
