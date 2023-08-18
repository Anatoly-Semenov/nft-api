import { MigrationInterface, QueryRunner } from 'typeorm';

export class createSolanaAccountTransferAggregationTable1665375853547
  implements MigrationInterface
{
  name = 'createSolanaAccountTransferAggregationTable1665375853547';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."solana_account_transfer_aggregation_game_contract_type_enum" AS ENUM('MARKETPLACE', 'GAME', 'ETC')`,
    );
    await queryRunner.query(
      `CREATE TABLE "solana_account_transfer_aggregation" ("id" SERIAL NOT NULL, "main_account_id" integer NOT NULL, "second_account_id" integer NOT NULL, "main_address" text NOT NULL, "second_address" text NOT NULL, "main_first_time" TIMESTAMP, "second_first_time" TIMESTAMP, "is_contract" boolean NOT NULL, "token_contract_id" integer NOT NULL, "token_contract_address" character varying NOT NULL, "token_contract_title" character varying NOT NULL, "token_price" double precision, "amount" numeric NOT NULL, "game_id" integer NOT NULL, "game_contract_type" "public"."solana_account_transfer_aggregation_game_contract_type_enum", "transaction_hash" character varying NOT NULL, "transaction_contract" character varying, "block_number" integer NOT NULL, "parent_id" integer NOT NULL, "is_system" boolean NOT NULL DEFAULT false, "method" character varying, "created_at" TIMESTAMP DEFAULT ('now'::text)::date, CONSTRAINT "PK_6e37cc2975cdef9697044bde2ed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_544c19d087556a4e6e0830414f" ON "solana_account_transfer_aggregation" ("main_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_784313744f1b5ba2c259f30066" ON "solana_account_transfer_aggregation" ("main_first_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c834a783d454872a0540a48e03" ON "solana_account_transfer_aggregation" ("is_contract") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18ad99a096f7649de40cb29bc1" ON "solana_account_transfer_aggregation" ("amount") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7ec49caf8e298b865550b476fc" ON "solana_account_transfer_aggregation" ("game_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d9cb59942a8086d7431664d8e8" ON "solana_account_transfer_aggregation" ("transaction_hash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7511f932cdbe772efc99bb4c31" ON "solana_account_transfer_aggregation" ("created_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7511f932cdbe772efc99bb4c31"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d9cb59942a8086d7431664d8e8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7ec49caf8e298b865550b476fc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_18ad99a096f7649de40cb29bc1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c834a783d454872a0540a48e03"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_784313744f1b5ba2c259f30066"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_544c19d087556a4e6e0830414f"`,
    );
    await queryRunner.query(`DROP TABLE "solana_account_transfer_aggregation"`);
    await queryRunner.query(
      `DROP TYPE "public"."solana_account_transfer_aggregation_game_contract_type_enum"`,
    );
  }
}
