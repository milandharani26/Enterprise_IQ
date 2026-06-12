import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultRoles1718000000002 implements MigrationInterface {
  name = 'SeedDefaultRoles1718000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "roles" (id, name, role_code) 
            VALUES 
                (uuid_generate_v4(), 'Employee', 'EMPLOYEE'),
                (uuid_generate_v4(), 'Manager', 'MANAGER'),
                (uuid_generate_v4(), 'Admin', 'ADMIN')
            ON CONFLICT ("role_code") DO NOTHING;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM "roles" WHERE "role_code" IN ('EMPLOYEE', 'MANAGER', 'ADMIN');
        `);
  }
}
