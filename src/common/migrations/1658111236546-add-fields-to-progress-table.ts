import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldsToProgressTable1658111236546
  implements MigrationInterface
{
  name = 'addFieldsToProgressTable1658111236546';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chain_parsing_progress" ADD "status" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "chain_parsing_progress" ADD "comment" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chain_parsing_progress" DROP COLUMN "comment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chain_parsing_progress" DROP COLUMN "status"`,
    );
  }
}
