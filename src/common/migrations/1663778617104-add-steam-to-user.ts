import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSteamToUser1663778617104 implements MigrationInterface {
  name = 'addSteamToUser1663778617104';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "steam" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "steam"`);
  }
}
