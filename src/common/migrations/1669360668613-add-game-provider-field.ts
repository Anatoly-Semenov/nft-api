import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGameProviderField1669360668613 implements MigrationInterface {
  name = 'addGameProviderField1669360668613';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."game_provider_enum" AS ENUM('EVM', 'SOLANA', 'STEAM', 'EPIC_GAMES')`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD "provider" "public"."game_provider_enum" NOT NULL DEFAULT 'EVM'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "provider"`);
    await queryRunner.query(`DROP TYPE "public"."game_provider_enum"`);
  }
}
