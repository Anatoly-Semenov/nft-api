import { MigrationInterface, QueryRunner } from 'typeorm';

export class setUserWalletNullable1652722311541 implements MigrationInterface {
  name = 'setUserWalletNullable1652722311541';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "walletAddress" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "walletAddress" SET NOT NULL`,
    );
  }
}
