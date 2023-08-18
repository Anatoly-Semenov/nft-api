import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameAnalyticsTablesAndFields1651478318712
  implements MigrationInterface
{
  name = 'renameAnalyticsTablesAndFields1651478318712';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "analytics_client_game"
                             (
                                 "id"                SERIAL  NOT NULL,
                                 "analyticsClientId" integer NOT NULL,
                                 "gameId"            integer NOT NULL,
                                 CONSTRAINT "PK_4d473d8329c510f840ec057f5ea" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "analytics_event"
                             (
                                 "id"                SERIAL            NOT NULL,
                                 "analyticsClientId" integer           NOT NULL,
                                 "datetime"          TIMESTAMP         NOT NULL,
                                 "eventName"         character varying NOT NULL,
                                 "playerId"          character varying,
                                 "data"              json,
                                 CONSTRAINT "PK_29d5b2021997dfc387aa5a05ae6" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "analytics_client"
                             (
                                 "id"     SERIAL            NOT NULL,
                                 "apiKey" character varying NOT NULL,
                                 "name"   character varying NOT NULL,
                                 "active" boolean           NOT NULL,
                                 CONSTRAINT "PK_76f5faf3b9f154f3a813f546953" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "analytics_player"
                             (
                                 "id"                SERIAL            NOT NULL,
                                 "analyticsClientId" integer           NOT NULL,
                                 "datetime"          TIMESTAMP         NOT NULL,
                                 "playerId"          character varying NOT NULL,
                                 "data"              json              NOT NULL,
                                 CONSTRAINT "PK_cc77225ee5d0f8436c403da9f90" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "analytics_player_user"
                             (
                                 "id"                      SERIAL            NOT NULL,
                                 "analyticsPlayerPlayerId" character varying NOT NULL,
                                 "playerId"                integer           NOT NULL,
                                 CONSTRAINT "PK_5e0dbfaf6a91c1f199a8f023112" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "analytics_player_user"`);
    await queryRunner.query(`DROP TABLE "analytics_player"`);
    await queryRunner.query(`DROP TABLE "analytics_client"`);
    await queryRunner.query(`DROP TABLE "analytics_event"`);
    await queryRunner.query(`DROP TABLE "analytics_client_game"`);
  }
}
