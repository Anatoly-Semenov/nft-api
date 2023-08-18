import { MigrationInterface, QueryRunner } from 'typeorm';

export class gameFieldsChanges1655790563879 implements MigrationInterface {
  name = 'gameFieldsChanges1655790563879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "backers"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "backers" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "min_investment_token" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "token_title" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "release_date" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "chain_title" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "in_use" SET DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "in_use" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "chain_title" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "release_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "token_title" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "min_investment_token" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "backers"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "backers" text array`,
    );
  }
}
