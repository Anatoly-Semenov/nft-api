import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTransactionContractToAccountTransaction1660055344185
  implements MigrationInterface
{
  name = 'addTransactionContractToAccountTransaction1660055344185';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_transaction_log" ADD "transaction_contract" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transaction_receipt" ADD "transaction_contract" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_transaction_receipt" DROP COLUMN "transaction_contract"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transaction_log" DROP COLUMN "transaction_contract"`,
    );
  }
}
