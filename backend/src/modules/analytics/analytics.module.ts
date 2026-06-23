import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ConversationMessage } from '../conversations/entities/conversation-message.entity';
import { Conversation } from '../conversations/entities/conversation.entity';
import { User } from '../users/entities/user.entity';
import { Assistant } from '../assistants/entities/assistant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationMessage,
      Conversation,
      User,
      Assistant,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
