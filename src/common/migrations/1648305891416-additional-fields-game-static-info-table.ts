import { MigrationInterface, QueryRunner } from 'typeorm';

export class additionalFieldsGameStaticInfoTable1648305891416
  implements MigrationInterface
{
  name = 'additionalFieldsGameStaticInfoTable1648305891416';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_static_info"
                ADD "current_price_usd" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_static_info"
                ADD "market_cap_usd" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_static_info" DROP COLUMN "market_cap_usd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_static_info" DROP COLUMN "current_price_usd"`,
    );
  }
}
