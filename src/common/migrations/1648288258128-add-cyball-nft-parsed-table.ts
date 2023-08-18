import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class addCyballNftParsedTable1648288258128
  implements MigrationInterface
{
  name = 'addCyballNftParsedTable1648288258128';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
    await queryRunner.createIndex(
      'cyball_nft_parsed',
      new TableIndex({
        name: 'idx_cyball_nft_parsed_token',
        columnNames: ['token'],
      }),
    );
    await queryRunner.createIndex(
      'cyball_nft_parsed',
      new TableIndex({
        name: 'idx_cyball_nft_parsed_rarity',
        columnNames: ['rarity'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'cyball_nft_parsed',
      'idx_cyball_nft_parsed_rarity',
    );
    await queryRunner.dropIndex(
      'cyball_nft_parsed',
      'idx_cyball_nft_parsed_token',
    );
    await queryRunner.query(`DROP TABLE "cyball_nft_parsed"`);
  }
}
