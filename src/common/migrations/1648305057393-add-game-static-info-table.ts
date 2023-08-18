import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGameStaticInfoTable1648305057393 implements MigrationInterface {
  name = 'addGameStaticInfoTable1648305057393';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "game_static_info"
             (
                 "id"               SERIAL  NOT NULL,
                 "game_id"          integer NOT NULL,
                 "month_return"     integer NOT NULL,
                 "month_return_usd" integer NOT NULL,
                 "player_count"     integer NOT NULL,
                 CONSTRAINT "PK_017e54fc16ff73446652c97be59" PRIMARY KEY ("id")
             )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "game_static_info"`);
  }
}
