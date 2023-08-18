import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateUserTable1651369814682 implements MigrationInterface {
  name = 'updateUserTable1651369814682';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "email" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "discord" text`);
    await queryRunner.query(`ALTER TABLE "user" ADD "twitter" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitter"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "discord"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email"`);
  }
}
