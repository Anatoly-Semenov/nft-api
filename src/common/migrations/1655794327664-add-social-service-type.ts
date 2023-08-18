import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSocialServiceType1655794327664 implements MigrationInterface {
  name = 'addSocialServiceType1655794327664';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "social_channel" DROP CONSTRAINT "UQ_498252efb5301a8ee3fc64b4b8c"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."social_channel_service_enum" RENAME TO "social_channel_service_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."social_channel_service_enum" AS ENUM('TWITTER', 'DISCORD', 'TELEGRAM', 'TELEGRAM_CHAT', 'MEDIUM', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_channel" ALTER COLUMN "service" TYPE "public"."social_channel_service_enum" USING "service"::"text"::"public"."social_channel_service_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."social_channel_service_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."social_session_service_enum" RENAME TO "social_session_service_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."social_session_service_enum" AS ENUM('TWITTER', 'DISCORD', 'TELEGRAM', 'TELEGRAM_CHAT', 'MEDIUM', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_session" ALTER COLUMN "service" TYPE "public"."social_session_service_enum" USING "service"::"text"::"public"."social_session_service_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."social_session_service_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_channel" ADD CONSTRAINT "UQ_498252efb5301a8ee3fc64b4b8c" UNIQUE ("service", "channel")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "social_channel" DROP CONSTRAINT "UQ_498252efb5301a8ee3fc64b4b8c"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."social_session_service_enum_old" AS ENUM('TWITTER', 'DISCORD', 'TELEGRAM', 'MEDIUM', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_session" ALTER COLUMN "service" TYPE "public"."social_session_service_enum_old" USING "service"::"text"::"public"."social_session_service_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."social_session_service_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."social_session_service_enum_old" RENAME TO "social_session_service_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."social_channel_service_enum_old" AS ENUM('TWITTER', 'DISCORD', 'TELEGRAM', 'MEDIUM', 'UNKNOWN')`,
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
  }
}
