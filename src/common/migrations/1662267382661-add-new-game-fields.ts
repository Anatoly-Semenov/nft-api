import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewGameFields1662267382661 implements MigrationInterface {
  name = 'addNewGameFields1662267382661';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game" ADD "chains" text`);
    await queryRunner.query(`ALTER TABLE "game" ADD "background_image" text`);
    await queryRunner.query(
      `CREATE INDEX "IDX_ae3274d080232cd2125e456ea2" ON "game_transaction" ("game_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_36f9877d6fb46a96ce292bd652" ON "game_transaction" ("grab_internal") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_36f9877d6fb46a96ce292bd652"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae3274d080232cd2125e456ea2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP COLUMN "background_image"`,
    );
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "chains"`);
  }
}
