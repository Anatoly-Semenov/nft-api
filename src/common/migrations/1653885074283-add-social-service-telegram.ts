import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSocialServiceTelegram1653885074283
  implements MigrationInterface
{
  name = 'addSocialServiceTelegram1653885074283';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."social_session_service_enum" AS ENUM('TWITTER', 'DISCORD', 'TELEGRAM', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "social_session" ("id" SERIAL NOT NULL, "service" "public"."social_session_service_enum" NOT NULL, "session" text NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_48d5d83c69f2066c9fa82940d5e" UNIQUE ("service"), CONSTRAINT "PK_980672922e8897f6dc2a38e1484" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_channel" DROP CONSTRAINT "UQ_498252efb5301a8ee3fc64b4b8c"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."social_channel_service_enum" RENAME TO "social_channel_service_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."social_channel_service_enum" AS ENUM('TWITTER', 'DISCORD', 'TELEGRAM', 'UNKNOWN')`,
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
      `DELETE FROM "public"."social_stats" WHERE "channel_id" IN (SELECT id FROM "public"."social_channel" WHERE "service" = 'TELEGRAM')`,
    );
    await queryRunner.query(
      `DELETE FROM "public"."social_channel" WHERE "service" = 'TELEGRAM'`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_channel" DROP CONSTRAINT "UQ_498252efb5301a8ee3fc64b4b8c"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."social_channel_service_enum_old" AS ENUM('TWITTER', 'DISCORD', 'UNKNOWN')`,
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
    await queryRunner.query(`DROP TABLE "social_session"`);
    await queryRunner.query(`DROP TYPE "public"."social_session_service_enum"`);
  }
}
