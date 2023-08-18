import { MigrationInterface, QueryRunner } from 'typeorm';

export class userTransactionAggregationTable1659339982751
  implements MigrationInterface
{
  name = 'userTransactionAggregationTable1659339982751';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_transaction_aggregation_game_contract_type_enum" AS ENUM('MARKETPLACE', 'GAME', 'ETC')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_transaction_aggregation" ("id" SERIAL NOT NULL, "user_address" text NOT NULL, "first_time" TIMESTAMP NOT NULL, "game_id" integer NOT NULL, "game_name" character varying NOT NULL, "game_contract_address" character varying, "game_contract_type" "public"."user_transaction_aggregation_game_contract_type_enum" NOT NULL, "amount" double precision NOT NULL, "token_contract_id" integer NOT NULL, "token_contract_address" character varying NOT NULL, "token_price" double precision, "block_number" integer NOT NULL, "transaction_hash" character varying NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT ('now'::text)::date, CONSTRAINT "UQ_40b7061c61f483336679f33a48b" UNIQUE ("game_id", "amount", "transaction_hash", "date"), CONSTRAINT "PK_d97d520d44259a582072d26aa2e" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_transaction_aggregation"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_transaction_aggregation_game_contract_type_enum"`,
    );
  }
}
