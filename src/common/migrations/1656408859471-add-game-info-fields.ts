import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGameInfoFields1656408859471 implements MigrationInterface {
  name = 'addGameInfoFields1656408859471';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "ido_platforms" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "release_status" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "release_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "ido_platforms"`,
    );
  }
}
