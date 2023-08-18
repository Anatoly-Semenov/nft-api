import { MigrationInterface, QueryRunner } from 'typeorm';

export class createMessengerTable1666948915468 implements MigrationInterface {
  name = 'createMessengerTable1666948915468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."message_user_status_enum" AS ENUM('NEW', 'READ')`,
    );
    await queryRunner.query(
      `CREATE TABLE "message_user" ("id" SERIAL NOT NULL, "message_id" integer NOT NULL, "walletAddress" character varying NOT NULL, "status" "public"."message_user_status_enum" NOT NULL DEFAULT 'NEW', CONSTRAINT "PK_54ce30caeb3f33d68398ea10376" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_55e46b2c7460a9d390d0f4ee0f" ON "message_user" ("message_id", "walletAddress") `,
    );
    await queryRunner.query(
      `CREATE TABLE "message" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "preview" character varying, "icon" character varying, "text" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "reward" integer NOT NULL, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "message"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55e46b2c7460a9d390d0f4ee0f"`,
    );
    await queryRunner.query(`DROP TABLE "message_user"`);
    await queryRunner.query(`DROP TYPE "public"."message_user_status_enum"`);
  }
}
