import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAssistantTable1718000000004 implements MigrationInterface {
  name = 'CreateAssistantTable1718000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "assistants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "assistant_code" character varying NOT NULL, "config" jsonb, "tools" jsonb, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ASSISTANT_CODE" UNIQUE ("assistant_code"), CONSTRAINT "PK_ASSISTANTS" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "assistants"`);
  }
}
