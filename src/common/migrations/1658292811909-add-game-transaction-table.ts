import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGameTransactionTable1658292811909
  implements MigrationInterface
{
  name = 'addGameTransactionTable1658292811909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "game_transaction" ("id" SERIAL NOT NULL, "game_id" integer NOT NULL, "transaction_hash" character varying NOT NULL, "block_number" integer NOT NULL, "created_at" TIMESTAMP NOT NULL, "address_from" character varying NOT NULL, "address_to" character varying NOT NULL, "value" numeric NOT NULL, "input" character varying NOT NULL, "grab_internal" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_2db1d21496563fa47db41d2e1c0" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "game_transaction"`);
  }
}
