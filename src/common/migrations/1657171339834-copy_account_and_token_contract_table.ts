import { MigrationInterface, QueryRunner } from 'typeorm';

export class copyAccountAndTokenContractTable1657171339834
  implements MigrationInterface
{
  name = 'copyAccountAndTokenContractTable1657171339834';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "solana_token_contract"
                             (
                                 "id"      SERIAL            NOT NULL,
                                 "address" character varying NOT NULL,
                                 "title"   character varying NOT NULL,
                                 "game_id" integer,
                                 CONSTRAINT "PK_061ebe0a928fc9d0bf8cb300599" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "solana_account"
                             (
                                 "id"          SERIAL            NOT NULL,
                                 "first_time"  TIMESTAMP         NOT NULL,
                                 "address"     character varying NOT NULL,
                                 "game_id"     integer           NOT NULL,
                                 "is_contract" boolean           NOT NULL DEFAULT false,
                                 "is_player"   boolean           NOT NULL DEFAULT false,
                                 CONSTRAINT "PK_6ce9dcbef4f2341281ae22324a9" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "solana_account"`);
    await queryRunner.query(`DROP TABLE "solana_token_contract"`);
  }
}
