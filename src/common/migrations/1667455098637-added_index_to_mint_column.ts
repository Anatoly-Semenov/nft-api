import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedIndexToMintColumn1667455098637 implements MigrationInterface {
  name = 'addedIndexToMintColumn1667455098637';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_c5dc6a4750ed198f6b9eaa6a6d" ON "solana_associated_token_account" ("mint") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c5dc6a4750ed198f6b9eaa6a6d"`,
    );
  }
}
