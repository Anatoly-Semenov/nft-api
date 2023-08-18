import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLogoFieldToGameTable1648047701772
  implements MigrationInterface
{
  name = 'addLogoFieldToGameTable1648047701772';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game"
            ADD "logo" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "logo"`);
  }
}
