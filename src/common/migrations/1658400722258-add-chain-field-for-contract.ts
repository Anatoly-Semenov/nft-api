import { MigrationInterface, QueryRunner } from 'typeorm';

export class addChainFieldForContract1658400722258
  implements MigrationInterface
{
  name = 'addChainFieldForContract1658400722258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "token_contract" ADD "chain_id" character varying NOT NULL DEFAULT 'binance-smart-chain'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "token_contract" DROP COLUMN "chain_id"`,
    );
  }
}
