import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTablesNameAndAddIndexes1661220693603
  implements MigrationInterface
{
  name = 'changeTablesNameAndAddIndexes1661220693603';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE account_transaction_receipt RENAME TO account_transfer_contract;`,
    );
    await queryRunner.query(
      `ALTER TABLE account_transaction_log RENAME TO account_transfer_token;`,
    );
    await queryRunner.query(
      `ALTER TABLE user_transaction_aggregation RENAME TO account_transfer_aggregation;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE account_transfer_aggregation RENAME TO user_transaction_aggregation;`,
    );
    await queryRunner.query(
      `ALTER TABLE account_transfer_token RENAME TO account_transaction_log;`,
    );
    await queryRunner.query(
      `ALTER TABLE account_transfer_contract RENAME TO account_transaction_receipt;`,
    );
  }
}
