import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeColumnFromAnalyticsUsers1650050712751
  implements MigrationInterface
{
  name = 'removeColumnFromAnalyticsUsers1650050712751';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analytics_users" DROP COLUMN "eventName"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analytics_users"
                ADD "eventName" character varying NOT NULL`,
    );
  }
}
