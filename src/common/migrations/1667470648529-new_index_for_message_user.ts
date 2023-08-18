import { MigrationInterface, QueryRunner } from 'typeorm';

export class newIndexForMessageUser1667470648529 implements MigrationInterface {
  name = 'newIndexForMessageUser1667470648529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_d43e65f8723678362878b29a7c" ON "message_user" ("message_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_525fd47a7fa55f59b8c7bb0604" ON "message_user" ("walletAddress") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_525fd47a7fa55f59b8c7bb0604"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d43e65f8723678362878b29a7c"`,
    );
  }
}
