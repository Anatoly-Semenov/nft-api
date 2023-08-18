import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldsForParsing1660808913886 implements MigrationInterface {
  name = 'addFieldsForParsing1660808913886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_transaction_log" RENAME COLUMN "transaction_type" TO "method"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transaction_receipt" RENAME COLUMN "transaction_type" TO "method"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD "is_system" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "is_system"`);
    await queryRunner.query(
      `ALTER TABLE "account_transaction_receipt" RENAME COLUMN "method" TO "transaction_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transaction_log" RENAME COLUMN "method" TO "transaction_type"`,
    );
  }
}
