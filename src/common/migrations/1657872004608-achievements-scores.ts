import { MigrationInterface, QueryRunner } from 'typeorm';

export class achievementsScores1657872004608 implements MigrationInterface {
  name = 'achievementsScores1657872004608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "scores"`);
    await queryRunner.query(
      `ALTER TABLE "achievement" ADD "scores" integer NOT NULL DEFAULT '1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "achievement" DROP COLUMN "scores"`);
    await queryRunner.query(
      `ALTER TABLE "nft" ADD "scores" integer NOT NULL DEFAULT '1'`,
    );
  }
}
