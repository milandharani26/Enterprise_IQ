import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyExistingUsersTable1718000000003 implements MigrationInterface {
  name = 'ModifyExistingUsersTable1718000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add column as nullable
    await queryRunner.query(`ALTER TABLE "users" ADD "role_id" uuid`);

    // 2. Set role_id for existing users
    await queryRunner.query(`
            UPDATE "users" 
            SET "role_id" = (SELECT id FROM "roles" WHERE role_code = 'EMPLOYEE')
        `);

    // 3. Make column NOT NULL
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL`,
    );

    // 4. Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_USERS_ROLE_ID" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_USERS_ROLE_ID"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role_id"`);
  }
}
