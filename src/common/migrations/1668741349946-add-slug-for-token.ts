import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSlugForToken1668741349946 implements MigrationInterface {
  name = 'addSlugForToken1668741349946';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "token_contract" ADD "slug" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "token_contract" DROP COLUMN "slug"`);
  }
}
