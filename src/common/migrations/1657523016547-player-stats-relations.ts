import { MigrationInterface, QueryRunner } from 'typeorm';

export class playerStatsRelations1657523016547 implements MigrationInterface {
  name = 'playerStatsRelations1657523016547';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT IF EXISTS "FK_35e3406e794d2ba2f551384f903"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "UQ_35e3406e794d2ba2f551384f903"`,
    );
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "playerStatsId"`);
    await queryRunner.query(
      `ALTER TABLE "player_stats" DROP CONSTRAINT "FK_dda32e4af0ba81ca82ac5379578"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stats" DROP CONSTRAINT "UQ_dda32e4af0ba81ca82ac5379578"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stats" ADD CONSTRAINT "FK_dda32e4af0ba81ca82ac5379578" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_stats" DROP CONSTRAINT "FK_dda32e4af0ba81ca82ac5379578"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stats" ADD CONSTRAINT "UQ_dda32e4af0ba81ca82ac5379578" UNIQUE ("gameId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stats" ADD CONSTRAINT "FK_dda32e4af0ba81ca82ac5379578" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "game" ADD "playerStatsId" integer`);
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "UQ_35e3406e794d2ba2f551384f903" UNIQUE ("playerStatsId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_35e3406e794d2ba2f551384f903" FOREIGN KEY ("playerStatsId") REFERENCES "player_stats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
