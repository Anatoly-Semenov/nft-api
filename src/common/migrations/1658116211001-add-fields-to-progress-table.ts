import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldsToProgressTable1658116211001
  implements MigrationInterface
{
  name = 'addFieldsToProgressTable1658116211001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chain_parsing_progress" ADD "updated_at" TIMESTAMP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chain_parsing_progress" DROP COLUMN "updated_at"`,
    );
  }
}
