import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGameUsersStatsTable1668045771960 implements MigrationInterface {
  name = 'addGameUsersStatsTable1668045771960';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "game_users_stats" ("id" SERIAL NOT NULL, "active_users" integer NOT NULL DEFAULT '0', "new_users" integer NOT NULL DEFAULT '0', "average" double precision NOT NULL DEFAULT '0', "earners" integer NOT NULL DEFAULT '0', "spenders" integer NOT NULL DEFAULT '0', "earnings" double precision NOT NULL DEFAULT '0', "spending" double precision NOT NULL DEFAULT '0', "new_paying_users" integer NOT NULL DEFAULT '0', "new_earners" integer NOT NULL DEFAULT '0', "new_spenders" integer NOT NULL DEFAULT '0', "new_earnings" double precision NOT NULL DEFAULT '0', "new_spending" double precision NOT NULL DEFAULT '0', "nft_trades" integer NOT NULL DEFAULT '0', "nft_amount" double precision NOT NULL DEFAULT '0', "nft_burn" integer NOT NULL DEFAULT '0', "nft_mint" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "game_id" integer, CONSTRAINT "UQ_c9f44890c6ab1992004831c8627" UNIQUE ("game_id", "created_at"), CONSTRAINT "PK_7d185f4e6297f85fc0495cc5d51" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_users_stats" ADD CONSTRAINT "FK_f08dc21a8c4cf59cb2f4d0122d5" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_users_stats" DROP CONSTRAINT "FK_f08dc21a8c4cf59cb2f4d0122d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "register_from" "public"."user_register_from_enum" NOT NULL DEFAULT 'MAIN_SITE'`,
    );
    await queryRunner.query(`DROP TABLE "game_users_stats"`);
  }
}
