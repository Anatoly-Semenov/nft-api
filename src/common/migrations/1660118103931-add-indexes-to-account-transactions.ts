import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexesToAccountTransactions1660118103931
  implements MigrationInterface
{
  name = 'addIndexesToAccountTransactions1660118103931';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_36ad3d2d97dae0ec0f386346be" ON "account_transaction_log" ("from_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_83d6c25395e6c28ceacb543f0b" ON "account_transaction_log" ("to_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0398dcc260fa31bbfba9ce5825" ON "account_transaction_receipt" ("from_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_de63f887cb00b318f73aa8471f" ON "account_transaction_receipt" ("to_account_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_de63f887cb00b318f73aa8471f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0398dcc260fa31bbfba9ce5825"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_83d6c25395e6c28ceacb543f0b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_36ad3d2d97dae0ec0f386346be"`,
    );
  }
}
