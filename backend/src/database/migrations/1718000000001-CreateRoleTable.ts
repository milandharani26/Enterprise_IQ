import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1718000000001 implements MigrationInterface {
  name = 'CreateRoleTable1718000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "role_code" character varying NOT NULL, "assistant_ids" uuid array, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ROLE_CODE" UNIQUE ("role_code"), CONSTRAINT "PK_ROLES" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
