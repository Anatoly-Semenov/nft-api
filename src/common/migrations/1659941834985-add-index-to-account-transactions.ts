import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexToAccountTransactions1659941834985
  implements MigrationInterface
{
  name = 'addIndexToAccountTransactions1659941834985';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_dc3ebebcf59b752750c1d0110f" ON "account_transaction_receipt" ("game_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc3ebebcf59b752750c1d0110f"`,
    );
  }
}
