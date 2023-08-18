import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRewardLinkProp1666778710405 implements MigrationInterface {
  name = 'addRewardLinkProp1666778710405';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reward" ADD "link" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reward" DROP COLUMN "link"`);
  }
}
