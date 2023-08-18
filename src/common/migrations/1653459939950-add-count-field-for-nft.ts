import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCountFieldForNft1653459939950 implements MigrationInterface {
  name = 'addCountFieldForNft1653459939950';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft" ADD "count" integer NOT NULL DEFAULT '1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "count"`);
  }
}
