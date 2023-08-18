import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexes1662701403471 implements MigrationInterface {
  name = 'addIndexes1662701403471';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_006f81cca464ec6152113695dc" ON "account_transfer_aggregation" ("transaction_hash") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_006f81cca464ec6152113695dc"`,
    );
  }
}
