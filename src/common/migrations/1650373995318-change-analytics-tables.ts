import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeAnalyticsTables1650373995318 implements MigrationInterface {
  name = 'changeAnalyticsTables1650373995318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analytics_clients"
                ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics_events"
                ALTER COLUMN "data" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analytics_events"
                ALTER COLUMN "data" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics_clients" DROP COLUMN "name"`,
    );
  }
}
