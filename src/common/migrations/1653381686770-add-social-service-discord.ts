import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSocialServiceDiscord1653381686770
  implements MigrationInterface
{
  name = 'addSocialServiceDiscord1653381686770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "social_stats" ADD "members_online_count" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_channel" DROP CONSTRAINT "UQ_498252efb5301a8ee3fc64b4b8c"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."social_channel_service_enum" RENAME TO "social_channel_service_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."social_channel_service_enum" AS ENUM('TWITTER', 'DISCORD', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_channel" ALTER COLUMN "service" TYPE "public"."social_channel_service_enum" USING "service"::"text"::"public"."social_channel_service_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."social_channel_service_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_channel" ADD CONSTRAINT "UQ_498252efb5301a8ee3fc64b4b8c" UNIQUE ("service", "channel")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "public"."social_stats" WHERE "channel_id" IN (SELECT id FROM "public"."social_channel" WHERE "service" = 'DISCORD')`,
    );
    await queryRunner.query(
      `DELETE FROM "public"."social_channel" WHERE "service" = 'DISCORD'`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_channel" DROP CONSTRAINT "UQ_498252efb5301a8ee3fc64b4b8c"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."social_channel_service_enum_old" AS ENUM('TWITTER', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_channel" ALTER COLUMN "service" TYPE "public"."social_channel_service_enum_old" USING "service"::"text"::"public"."social_channel_service_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."social_channel_service_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."social_channel_service_enum_old" RENAME TO "social_channel_service_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_channel" ADD CONSTRAINT "UQ_498252efb5301a8ee3fc64b4b8c" UNIQUE ("service", "channel")`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_stats" DROP COLUMN "members_online_count"`,
    );
  }
}
