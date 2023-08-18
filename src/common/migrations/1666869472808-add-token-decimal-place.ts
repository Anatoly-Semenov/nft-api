import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTokenDecimalPlace1666869472808 implements MigrationInterface {
  name = 'addTokenDecimalPlace1666869472808';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_transfer_aggregation" ADD "token_decimal_place" integer NOT NULL DEFAULT '18'`,
    );
    await queryRunner.query(
      `ALTER TABLE "token_contract" ADD "decimal_place" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "token_contract" DROP COLUMN "decimal_place"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer_aggregation" DROP COLUMN "token_decimal_place"`,
    );
  }
}
