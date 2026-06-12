import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ConversationMessage } from './conversation-message.entity';

@Entity('conversations')
@Index(['user_id'])
@Index(['agent_id'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  agent_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // @ManyToOne('Agent')
  // @JoinColumn({ name: 'agent_id' })
  // agent: any;

  @OneToMany(() => ConversationMessage, (message) => message.conversation)
  messages: ConversationMessage[];
}
