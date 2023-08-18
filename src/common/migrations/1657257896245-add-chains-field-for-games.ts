import { MigrationInterface, QueryRunner } from 'typeorm';

export class addChainsFieldForGames1657257896245 implements MigrationInterface {
  name = 'addChainsFieldForGames1657257896245';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "chains" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "chains"`,
    );
  }
}
