import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewColumnSolanaAccountToUser1666176446590
  implements MigrationInterface
{
  name = 'addNewColumnSolanaAccountToUser1666176446590';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "solanaAccount" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_208ac5b5aa87bd2b3fa319cfc56" UNIQUE ("solanaAccount")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_208ac5b5aa87bd2b3fa319cfc56"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "solanaAccount"`);
  }
}
