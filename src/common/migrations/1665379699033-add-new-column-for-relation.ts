import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewColumnForRelation1665379699033
  implements MigrationInterface
{
  name = 'addNewColumnForRelation1665379699033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "solana_token_contract" ADD "token_contract_id" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "solana_token_contract" DROP COLUMN "token_contract_id"`,
    );
  }
}
