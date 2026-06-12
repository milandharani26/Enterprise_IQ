import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyExistingUsersTable1718000000003 implements MigrationInterface {
  name = 'ModifyExistingUsersTable1718000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying,
        "hashedRefreshToken" character varying,
        "role_id" uuid,
        CONSTRAINT "UQ_EMAIL" UNIQUE ("email"),
        CONSTRAINT "PK_USERS" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_USERS_ROLE_ID" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_USERS_ROLE_ID"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
