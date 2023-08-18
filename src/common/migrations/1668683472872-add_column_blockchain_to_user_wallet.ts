import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnBlockchainToUserWallet1668683472872
  implements MigrationInterface
{
  name = 'addColumnBlockchainToUserWallet1668683472872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_wallet_blockchain_type_enum" AS ENUM('EVM', 'SOLANA')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_wallet" ADD "blockchain_type" "public"."user_wallet_blockchain_type_enum" NOT NULL DEFAULT 'EVM'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_wallet" DROP COLUMN "blockchain_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_wallet_blockchain_type_enum"`,
    );
  }
}
