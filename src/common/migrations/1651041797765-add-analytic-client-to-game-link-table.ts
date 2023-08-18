import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAnalyticClientToGameLinkTable1651041797765
  implements MigrationInterface
{
  name = 'addAnalyticClientToGameLinkTable1651041797765';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "analytics_clients_game" ("id" SERIAL NOT NULL, "analytics_client_id" integer NOT NULL, "game_id" integer NOT NULL, CONSTRAINT "PK_1edaa56a17761525ed46ea57a98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT '2022-04-27 06:40:49.16'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT '2022-04-27 06:40:49.16'`,
    );
    await queryRunner.query(`DROP TABLE "analytics_clients_game"`);
  }
}
