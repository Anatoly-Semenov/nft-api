import { MigrationInterface, QueryRunner } from 'typeorm';

export class newColumnForSolanaSignatureTable1657016158110
  implements MigrationInterface
{
  name = 'newColumnForSolanaSignatureTable1657016158110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "solana_signature"
        ADD "account_id" integer`);
    await queryRunner.query(`ALTER TABLE "solana_signature"
        ALTER COLUMN "solana_associated_token_account_id" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "solana_signature"
        ALTER COLUMN "solana_associated_token_account_id" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "solana_signature" DROP COLUMN "account_id"`,
    );
  }
}
