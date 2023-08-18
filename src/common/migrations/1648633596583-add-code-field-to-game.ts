import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCodeFieldToGame1648633596583 implements MigrationInterface {
  name = 'addCodeFieldToGame1648633596583';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."game_code_enum" AS ENUM('BOMB_CRYPTO', 'AXIE_INFINITY', 'PEGAXY', 'CYBALL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "game"
                ADD "code" "public"."game_code_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "code"`);
    await queryRunner.query(`DROP TYPE "public"."game_code_enum"`);
  }
}
