import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeGameInfoAggregatedFieldsTypes1652697429711
  implements MigrationInterface
{
  name = 'changeGameInfoAggregatedFieldsTypes1652697429711';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" DROP COLUMN "monthly_return_token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" ADD "monthly_return_token" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" DROP COLUMN "monthly_return_usd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" ADD "monthly_return_usd" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" DROP COLUMN "floor_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" ADD "floor_price" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" DROP COLUMN "floor_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" ADD "floor_price" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" DROP COLUMN "monthly_return_usd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" ADD "monthly_return_usd" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" DROP COLUMN "monthly_return_token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" ADD "monthly_return_token" real`,
    );
  }
}
