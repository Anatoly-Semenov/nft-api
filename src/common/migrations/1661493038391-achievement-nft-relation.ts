import { MigrationInterface, QueryRunner } from 'typeorm';

export class achievementNftRelation1661493038391 implements MigrationInterface {
  name = 'achievementNftRelation1661493038391';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_achievements_achievement" DROP CONSTRAINT "FK_7e9948f0526458116eba66c0e97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_achievements_achievement" ADD CONSTRAINT "FK_7e9948f0526458116eba66c0e97" FOREIGN KEY ("achievementId") REFERENCES "achievement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_achievements_achievement" DROP CONSTRAINT "FK_7e9948f0526458116eba66c0e97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_achievements_achievement" ADD CONSTRAINT "FK_7e9948f0526458116eba66c0e97" FOREIGN KEY ("achievementId") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
