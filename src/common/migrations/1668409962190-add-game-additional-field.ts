import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGameAdditionalField1668409962190 implements MigrationInterface {
  name = 'addGameAdditionalField1668409962190';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "ino_status" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "ino_status"`,
    );
  }
}
