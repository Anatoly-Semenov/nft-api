import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeGamesInfoStructure1655773220232
  implements MigrationInterface
{
  name = 'changeGamesInfoStructure1655773220232';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "platforms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "token_address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "token_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "tokenName" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."game_additional_info_ido_date_estimation_enum" AS ENUM('DAY', 'MONTH', 'QUARTER', 'YEAR')`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "ido_date_estimation" "public"."game_additional_info_ido_date_estimation_enum" NOT NULL DEFAULT 'DAY'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."game_additional_info_ino_date_estimation_enum" AS ENUM('DAY', 'MONTH', 'QUARTER', 'YEAR')`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "ino_date_estimation" "public"."game_additional_info_ino_date_estimation_enum" NOT NULL DEFAULT 'DAY'`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "release_date" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."game_additional_info_release_date_estimation_enum" AS ENUM('DAY', 'MONTH', 'QUARTER', 'YEAR')`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "release_date_estimation" "public"."game_additional_info_release_date_estimation_enum" NOT NULL DEFAULT 'DAY'`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "ido_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "ido_date" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "ino_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "ino_date" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "genre" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "genre" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "ino_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "ino_date" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "ido_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "ido_date" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "release_date_estimation"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."game_additional_info_release_date_estimation_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "release_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "ino_date_estimation"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."game_additional_info_ino_date_estimation_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "ido_date_estimation"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."game_additional_info_ido_date_estimation_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "tokenName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "token_price" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "token_address" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "token" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "platforms" text array`,
    );
  }
}
