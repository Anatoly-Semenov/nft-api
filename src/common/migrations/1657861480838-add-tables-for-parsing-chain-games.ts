import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTablesForParsingChainGames1657861480838
  implements MigrationInterface
{
  name = 'addTablesForParsingChainGames1657861480838';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "account_transaction_receipt" ("id" SERIAL NOT NULL, "from_account_id" integer NOT NULL, "to_account_id" integer NOT NULL, "token_contract_id" integer NOT NULL, "token_id" numeric, "amount" numeric, "created_at" TIMESTAMP, "game_id" integer NOT NULL, "transaction_type" character varying, "block_number" integer NOT NULL, "transaction_hash" character varying NOT NULL, CONSTRAINT "PK_a5c24d88930bf9d89a414187852" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account_transaction" ("id" SERIAL NOT NULL, "from_account_id" integer NOT NULL, "to_account_id" integer NOT NULL, "token_contract_id" integer NOT NULL, "token_id" numeric, "amount" numeric, "created_at" TIMESTAMP NOT NULL, "game_id" integer NOT NULL, "transaction_type" character varying NOT NULL, "block_number" integer NOT NULL, "transaction_hash" character varying NOT NULL, CONSTRAINT "PK_eba337658ffe8785716a99dcb92" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account" ("id" SERIAL NOT NULL, "first_block" integer NOT NULL, "address" character varying NOT NULL, "game_id" integer NOT NULL, "is_contract" boolean NOT NULL DEFAULT false, "is_player" boolean NOT NULL DEFAULT false, "first_time" TIMESTAMP, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account_token_balance" ("id" SERIAL NOT NULL, "account_id" integer NOT NULL, "token_id" integer NOT NULL, "amount" double precision NOT NULL, CONSTRAINT "PK_15f3a1b8d5fd573ef6077654e72" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account_transaction_log" ("id" SERIAL NOT NULL, "from_account_id" integer NOT NULL, "to_account_id" integer NOT NULL, "token_contract_id" integer NOT NULL, "token_id" numeric, "amount" numeric, "created_at" TIMESTAMP, "game_id" integer NOT NULL, "transaction_type" character varying, "block_number" integer NOT NULL, "transaction_hash" character varying NOT NULL, CONSTRAINT "PK_b41efad0627b8a886d282e38ee1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "game_wallet" ("id" SERIAL NOT NULL, "address" character varying NOT NULL, "title" character varying NOT NULL, "game_id" integer, "force_grab_internal" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_77dbb5b821e4d3f74b194de071a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "game_contract" ("id" SERIAL NOT NULL, "address" character varying NOT NULL, "title" character varying NOT NULL, "game_id" integer, "force_grab_internal" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_01ee6a173bf360b4ed2bbb1b813" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "token_contract" ("id" SERIAL NOT NULL, "address" character varying NOT NULL, "title" character varying NOT NULL, "game_id" integer, "is_coin" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_5c85dbbd108d915a13f71de39ad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chain_parsing_progress" ("id" SERIAL NOT NULL, "started_at" TIMESTAMP NOT NULL, "game_id" integer, "start_value" integer NOT NULL, "current_value" integer NOT NULL, "end_value" integer NOT NULL, "time_left_ms" integer NOT NULL, "type" character varying NOT NULL, "step" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_bd14822d314b731555215242c79" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "chain_parsing_progress"`);
    await queryRunner.query(`DROP TABLE "token_contract"`);
    await queryRunner.query(`DROP TABLE "game_contract"`);
    await queryRunner.query(`DROP TABLE "game_wallet"`);
    await queryRunner.query(`DROP TABLE "account_transaction_log"`);
    await queryRunner.query(`DROP TABLE "account_token_balance"`);
    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(`DROP TABLE "account_transaction"`);
    await queryRunner.query(`DROP TABLE "account_transaction_receipt"`);
  }
}
