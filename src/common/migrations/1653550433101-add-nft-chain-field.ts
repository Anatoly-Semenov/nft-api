import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNftChainField1653550433101 implements MigrationInterface {
  name = 'addNftChainField1653550433101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" ADD "chain" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "chain"`);
  }
}
