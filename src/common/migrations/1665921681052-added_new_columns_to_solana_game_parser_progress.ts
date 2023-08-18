import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedNewColumnsToSolanaGameParserProgress1665921681052
  implements MigrationInterface
{
  name = 'addedNewColumnsToSolanaGameParserProgress1665921681052';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "solana_game_parser_progress" ADD "aggregation_method_number" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "solana_game_parser_progress" DROP COLUMN "aggregation_method_number"`,
    );
  }
}
