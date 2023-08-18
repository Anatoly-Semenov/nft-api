import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexToGameTransaction1659861293346
  implements MigrationInterface
{
  name = 'addIndexToGameTransaction1659861293346';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_36f9877d6fb46a96ce292bd652" ON "game_transaction" ("grab_internal") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_36f9877d6fb46a96ce292bd652"`,
    );
  }
}
