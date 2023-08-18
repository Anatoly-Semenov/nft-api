import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexes1662387919062 implements MigrationInterface {
  name = 'addIndexes1662387919062';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_77620ee569ba18aa6214171929" ON "account_transfer_aggregation" ("main_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_71324b375b826f4402e02079e9" ON "account_transfer_aggregation" ("main_first_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_509f114137effa97341a7a97b4" ON "account_transfer_aggregation" ("is_contract") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8335ebf2c6ae5557416d71de7c" ON "account_transfer_aggregation" ("amount") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1bc9ac15ddbc0cbc73832c77ac" ON "account_transfer_aggregation" ("game_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2717ed0786b14591cdf467cfd8" ON "account_transfer_aggregation" ("created_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2717ed0786b14591cdf467cfd8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1bc9ac15ddbc0cbc73832c77ac"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8335ebf2c6ae5557416d71de7c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_509f114137effa97341a7a97b4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_71324b375b826f4402e02079e9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_77620ee569ba18aa6214171929"`,
    );
  }
}
