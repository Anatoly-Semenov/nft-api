import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateGameCodeEnum1648634680841 implements MigrationInterface {
  name = 'updateGameCodeEnum1648634680841';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."game_code_enum" RENAME TO "game_code_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."game_code_enum" AS ENUM('BOMB_CRYPTO', 'AXIE_INFINITY', 'PEGAXY', 'CYBALL', 'METAGEAR', 'DRUNK_ROBOTS')`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "code" TYPE "public"."game_code_enum" USING "code"::"text"::"public"."game_code_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."game_code_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."game_code_enum_old" AS ENUM('BOMB_CRYPTO', 'AXIE_INFINITY', 'PEGAXY', 'CYBALL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "code" TYPE "public"."game_code_enum_old" USING "code"::"text"::"public"."game_code_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."game_code_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."game_code_enum_old" RENAME TO "game_code_enum"`,
    );
  }
}
