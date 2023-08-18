import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeGameInfoRelation1654758078102 implements MigrationInterface {
  name = 'changeGameInfoRelation1654758078102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP CONSTRAINT "FK_35060cba909bb5e92cf15340d42"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP CONSTRAINT "REL_35060cba909bb5e92cf15340d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP COLUMN "gameId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD "additionalInfoId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "UQ_8f8a8c4da212aeb0ae535d971d8" UNIQUE ("additionalInfoId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_8f8a8c4da212aeb0ae535d971d8" FOREIGN KEY ("additionalInfoId") REFERENCES "game_additional_info"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_8f8a8c4da212aeb0ae535d971d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "UQ_8f8a8c4da212aeb0ae535d971d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP COLUMN "additionalInfoId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD "gameId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD CONSTRAINT "REL_35060cba909bb5e92cf15340d4" UNIQUE ("gameId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD CONSTRAINT "FK_35060cba909bb5e92cf15340d42" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
