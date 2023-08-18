import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexToGameTransaction1659860486722
  implements MigrationInterface
{
  name = 'addIndexToGameTransaction1659860486722';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_ae3274d080232cd2125e456ea2" ON "game_transaction" ("game_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae3274d080232cd2125e456ea2"`,
    );
  }
}
