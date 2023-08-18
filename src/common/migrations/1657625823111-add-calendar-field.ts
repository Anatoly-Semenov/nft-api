import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCalendarField1657625823111 implements MigrationInterface {
  name = 'addCalendarField1657625823111';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "tokenName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "token_name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "ido_status" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "ido_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "token_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "tokenName" character varying`,
    );
  }
}
