import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexesToGameTransaction1667319395145
  implements MigrationInterface
{
  name = 'addIndexesToGameTransaction1667319395145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_92b2145e1fd0406e13e050d55d" ON "game_transaction" ("id", "game_id", "grab_internal") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_92b2145e1fd0406e13e050d55d"`,
    );
  }
}
