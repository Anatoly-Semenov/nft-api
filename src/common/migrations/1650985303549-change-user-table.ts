import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeUserTable1650985303549 implements MigrationInterface {
  name = 'changeUserTable1650985303549';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_roles_enum" AS ENUM('user', 'player', 'investor', 'admin')`,
    );
    await queryRunner.query(`CREATE TABLE "user"
                                 (
                                     "id"            SERIAL            NOT NULL,
                                     "walletAddress" character varying NOT NULL,
                                     "roles"         "public"."user_roles_enum" array NOT NULL DEFAULT '{user}',
                                     "displayedName" character varying,
                                     "nonce"         character varying,
                                     "updatedAt"     TIMESTAMP         NOT NULL DEFAULT now()',
                                     "createdAt"     TIMESTAMP         NOT NULL DEFAULT now()',
                                     CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
                                 )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_roles_enum"`);
  }
}
