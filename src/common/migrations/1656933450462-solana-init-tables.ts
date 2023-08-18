import { MigrationInterface, QueryRunner } from 'typeorm';

export class solanaInitTables1656933450462 implements MigrationInterface {
  name = 'solanaInitTables1656933450462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."solana_account_transaction_transaction_type_enum" AS ENUM('TRANSFER')`,
    );
    await queryRunner.query(`CREATE TABLE "solana_account_transaction"
                             (
                                 "id"                SERIAL                                                      NOT NULL,
                                 "from_account_id"   integer                                                     NOT NULL,
                                 "to_account_id"     integer                                                     NOT NULL,
                                 "token_id"          character varying,
                                 "amount"            bigint,
                                 "created_at"        TIMESTAMP                                                   NOT NULL,
                                 "transaction_hash"  character varying                                           NOT NULL,
                                 "token_contract_id" integer                                                     NOT NULL,
                                 "game_id"           integer                                                     NOT NULL,
                                 "transaction_type"  "public"."solana_account_transaction_transaction_type_enum" NOT NULL DEFAULT 'TRANSFER',
                                 CONSTRAINT "PK_27ce0ff3ec22c92d18c344ba278" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE TYPE "public"."solana_associated_token_account_type_enum" AS ENUM('NFT', 'COIN', 'UNKNOWN', 'UNUSED')`,
    );
    await queryRunner.query(`CREATE TABLE "solana_associated_token_account"
                             (
                                 "id"                       SERIAL                                               NOT NULL,
                                 "mint"                     character varying                                    NOT NULL,
                                 "associated_token_account" character varying                                    NOT NULL,
                                 "type"                     "public"."solana_associated_token_account_type_enum" NOT NULL DEFAULT 'UNKNOWN',
                                 "account_id"               integer                                              NOT NULL,
                                 CONSTRAINT "PK_b49c9fd80fc7292d1957aa6f2ce" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE TYPE "public"."solana_signature_state_enum" AS ENUM('NEW', 'PROCESSED', 'IN_PROGRESS', 'NEW_LAST_SIGNATURE', 'PROCESSED_LAST_SIGNATURE', 'IN_PROGRESS_LAST_SIGNATURE', 'NEW_FIRST_SIGNATURE', 'PROCESSED_FIRST_SIGNATURE', 'IN_PROGRESS_FIRST_SIGNATURE')`,
    );
    await queryRunner.query(`CREATE TABLE "solana_signature"
                             (
                                 "id"                                 SERIAL                                 NOT NULL,
                                 "signature"                          character varying                      NOT NULL,
                                 "slot"                               integer                                NOT NULL,
                                 "is_failed"                          boolean                                NOT NULL DEFAULT false,
                                 "block_time"                         integer                                NOT NULL,
                                 "state"                              "public"."solana_signature_state_enum" NOT NULL DEFAULT 'NEW',
                                 "solana_associated_token_account_id" integer                                NOT NULL,
                                 CONSTRAINT "PK_dfd75b63e287c11c4af57ed4a81" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "solana_nft_transfer"
                             (
                                 "id"                SERIAL            NOT NULL,
                                 "from_account_id"   integer           NOT NULL,
                                 "to_account_id"     integer           NOT NULL,
                                 "token_id"          character varying,
                                 "buyer_amount"      bigint,
                                 "seller_amount"     bigint,
                                 "created_at"        TIMESTAMP         NOT NULL,
                                 "transaction_hash"  character varying NOT NULL,
                                 "token_contract_id" integer           NOT NULL,
                                 "game_id"           integer           NOT NULL,
                                 CONSTRAINT "PK_fe122c1d907fc52053e869274ad" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "solana_nft_transfer"`);
    await queryRunner.query(`DROP TABLE "solana_signature"`);
    await queryRunner.query(`DROP TYPE "public"."solana_signature_state_enum"`);
    await queryRunner.query(`DROP TABLE "solana_associated_token_account"`);
    await queryRunner.query(
      `DROP TYPE "public"."solana_associated_token_account_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "solana_account_transaction"`);
    await queryRunner.query(
      `DROP TYPE "public"."solana_account_transaction_transaction_type_enum"`,
    );
  }
}
