import { MigrationInterface, QueryRunner } from 'typeorm';

export class solanaAccountAddressGameIdIndex1660564173036
  implements MigrationInterface
{
  name = 'solanaAccountAddressGameIdIndex1660564173036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_803748f3c9c7e89fb69a788109" ON "solana_account" ("address", "game_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_803748f3c9c7e89fb69a788109"`,
    );
  }
}
