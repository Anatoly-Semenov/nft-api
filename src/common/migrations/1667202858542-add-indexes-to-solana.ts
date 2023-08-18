import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexesToSolana1667202858542 implements MigrationInterface {
  name = 'addIndexesToSolana1667202858542';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_a8ab33c8af31a55f1d3e9e5acc" ON "solana_nft_transfer" ("token_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d1911c76b4a35442fd07f8d92a" ON "solana_nft_transfer" ("created_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d1911c76b4a35442fd07f8d92a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a8ab33c8af31a55f1d3e9e5acc"`,
    );
  }
}
