import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateConversationsTables1718000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'conversations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'agent_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'conversation_messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'conversation_id',
            type: 'uuid',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['user', 'assistant', 'system', 'tool'],
            enumName: 'message_role_enum',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndices('conversations', [
      new TableIndex({
        columnNames: ['user_id'],
      }),
      new TableIndex({
        columnNames: ['agent_id'],
      }),
    ]);

    await queryRunner.createIndices('conversation_messages', [
      new TableIndex({
        columnNames: ['conversation_id'],
      }),
      new TableIndex({
        columnNames: ['created_at'],
      }),
    ]);

    await queryRunner.createForeignKeys('conversations', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['agent_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'agents',
        onDelete: 'SET NULL',
      }),
    ]);

    await queryRunner.createForeignKey(
      'conversation_messages',
      new TableForeignKey({
        columnNames: ['conversation_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'conversations',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const messagesTable = await queryRunner.getTable('conversation_messages');
    if (messagesTable) {
      const conversationFk = messagesTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('conversation_id') !== -1,
      );
      if (conversationFk)
        await queryRunner.dropForeignKey(
          'conversation_messages',
          conversationFk,
        );
    }

    const conversationsTable = await queryRunner.getTable('conversations');
    if (conversationsTable) {
      const userFk = conversationsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (userFk) await queryRunner.dropForeignKey('conversations', userFk);

      const agentFk = conversationsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('agent_id') !== -1,
      );
      if (agentFk) await queryRunner.dropForeignKey('conversations', agentFk);
    }

    await queryRunner.dropTable('conversation_messages');
    await queryRunner.dropTable('conversations');
  }
}
