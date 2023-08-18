import { MigrationInterface, QueryRunner } from 'typeorm';

export class createAirdropMaticTable1666592445615
  implements MigrationInterface
{
  name = 'createAirdropMaticTable1666592445615';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."airdrop_matic_status_enum" AS ENUM('SEND', 'VERIFIED_SEND')`,
    );
    await queryRunner.query(
      `CREATE TABLE "airdrop_matic" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "transaction_hash" character varying, "status" "public"."airdrop_matic_status_enum" NOT NULL DEFAULT 'SEND', "request_time" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_07cd8cbc7c24437f215686506c5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0a341dfb1032f8186261c402aa" ON "airdrop_matic" ("user_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0a341dfb1032f8186261c402aa"`,
    );
    await queryRunner.query(`DROP TABLE "airdrop_matic"`);
    await queryRunner.query(`DROP TYPE "public"."airdrop_matic_status_enum"`);
  }
}
