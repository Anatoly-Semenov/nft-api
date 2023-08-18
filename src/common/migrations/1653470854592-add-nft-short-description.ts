import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNftShortDescription1653470854592 implements MigrationInterface {
  name = 'addNftShortDescription1653470854592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft" ADD "shortDescription" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "shortDescription"`);
  }
}
