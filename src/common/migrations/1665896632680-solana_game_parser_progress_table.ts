import { MigrationInterface, QueryRunner } from 'typeorm';

export class solanaGameParserProgressTable1665896632680
  implements MigrationInterface
{
  name = 'solanaGameParserProgressTable1665896632680';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "solana_game_parser_progress" ("id" SERIAL NOT NULL, "game_id" integer NOT NULL, "activity_number" integer NOT NULL, "method_number" integer NOT NULL, CONSTRAINT "PK_9a7a20f842a3ed94b237202435e" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "solana_game_parser_progress"`);
  }
}
