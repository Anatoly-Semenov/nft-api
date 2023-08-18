import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIsSystemFieldToGameWallet1660664515051
  implements MigrationInterface
{
  name = 'addIsSystemFieldToGameWallet1660664515051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_wallet" ADD "is_system" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_wallet" DROP COLUMN "is_system"`,
    );
  }
}
