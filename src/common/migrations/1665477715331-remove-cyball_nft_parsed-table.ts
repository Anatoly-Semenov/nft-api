import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class removeCyballNftParsedTable1665477715331
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "cyball_nft_parsed"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cyball_nft_parsed"
             (
                 "id"     SERIAL            NOT NULL,
                 "token"  character varying NOT NULL,
                 "nft_id" integer           NOT NULL,
                 "rarity" character varying NOT NULL,
                 CONSTRAINT "PK_9a766d328a7040b8beb361fd0dd" PRIMARY KEY ("id"),
                 UNIQUE (token, nft_id)
             )`,
    );
  }
}
