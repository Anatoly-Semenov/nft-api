import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAnalyticsTables1649867262384 implements MigrationInterface {
  name = 'addAnalyticsTables1649867262384';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "analytics_clients"
             (
                 "id"     SERIAL            NOT NULL,
                 "apiKey" character varying NOT NULL,
                 "active" boolean           NOT NULL,
                 CONSTRAINT "PK_c5b0a31581130eb324f7b6e875c" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "analytics_events"
             (
                 "id"                SERIAL            NOT NULL,
                 "analyticsClientId" integer           NOT NULL,
                 "datetime"          TIMESTAMP         NOT NULL,
                 "eventName"         character varying NOT NULL,
                 "userId"            character varying,
                 "data"              json              NOT NULL,
                 CONSTRAINT "PK_5d643d67a09b55653e98616f421" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "analytics_users"
             (
                 "id"                SERIAL            NOT NULL,
                 "analyticsClientId" integer           NOT NULL,
                 "datetime"          TIMESTAMP         NOT NULL,
                 "eventName"         character varying NOT NULL,
                 "userId"            character varying NOT NULL,
                 "data"              json              NOT NULL,
                 CONSTRAINT "PK_933a529255f6f0bb71cafe63a11" PRIMARY KEY ("id")
             )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "analytics_users"`);
    await queryRunner.query(`DROP TABLE "analytics_events"`);
    await queryRunner.query(`DROP TABLE "analytics_clients"`);
  }
}
