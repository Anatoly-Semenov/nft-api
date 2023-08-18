import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSocialsTables1653364956014 implements MigrationInterface {
  name = 'addSocialsTables1653364956014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."social_channel_service_enum" AS ENUM('TWITTER', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "social_channel" ("id" SERIAL NOT NULL, "game_id" integer NOT NULL, "service" "public"."social_channel_service_enum" NOT NULL, "channel" text NOT NULL, CONSTRAINT "UQ_498252efb5301a8ee3fc64b4b8c" UNIQUE ("service", "channel"), CONSTRAINT "PK_c3ab4dadb89acdca225b34cc02b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "social_stats" ("id" SERIAL NOT NULL, "game_id" integer NOT NULL, "channel_id" integer NOT NULL, "members_count" integer NOT NULL, "posts_count" integer NOT NULL, "reposts_count" integer NOT NULL, "likes_count" integer NOT NULL, "comments_count" integer NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT ('now'::text)::date, CONSTRAINT "UQ_7fffeaba7779e223acc6f684187" UNIQUE ("game_id", "channel_id", "date"), CONSTRAINT "PK_0142b96fd77a78e4f3c5a1aca00" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "social_stats"`);
    await queryRunner.query(`DROP TABLE "social_channel"`);
    await queryRunner.query(`DROP TYPE "public"."social_channel_service_enum"`);
  }
}
