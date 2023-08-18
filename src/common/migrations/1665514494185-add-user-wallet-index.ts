import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserWalletIndex1665514494185 implements MigrationInterface {
  name = 'addUserWalletIndex1665514494185';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_efbd1135797e451d834bcf88cd2" UNIQUE ("walletAddress")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_efbd1135797e451d834bcf88cd2"`,
    );
  }
}
