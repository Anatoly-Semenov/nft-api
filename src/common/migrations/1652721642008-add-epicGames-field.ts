import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEpicGamesField1652721642008 implements MigrationInterface {
  name = 'addEpicGamesField1652721642008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "epicGames" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "epicGames"`);
  }
}
