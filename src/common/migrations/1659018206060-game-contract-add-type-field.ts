import { MigrationInterface, QueryRunner } from 'typeorm';

export class gameContractAddTypeField1659018206060
  implements MigrationInterface
{
  name = 'gameContractAddTypeField1659018206060';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."game_contract_type_enum" AS ENUM('MARKETPLACE', 'GAME', 'ETC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_contract" ADD "type" "public"."game_contract_type_enum" NOT NULL DEFAULT 'GAME'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game_contract" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."game_contract_type_enum"`);
  }
}
