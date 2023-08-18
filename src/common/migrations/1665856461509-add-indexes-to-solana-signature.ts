import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexesToSolanaSignature1665856461509
  implements MigrationInterface
{
  name = 'addIndexesToSolanaSignature1665856461509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_d9c54d3ab31a49639f2df2d20e" ON "solana_signature" ("signature") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e39cda074544e418a9f5b9d425" ON "solana_signature" ("slot") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_07ed0780ed238750674b20520f" ON "solana_signature" ("account_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_07ed0780ed238750674b20520f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e39cda074544e418a9f5b9d425"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d9c54d3ab31a49639f2df2d20e"`,
    );
  }
}
