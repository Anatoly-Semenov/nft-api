import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTimeLeftMsTypeInParserProgress1660929127184
  implements MigrationInterface
{
  name = 'changeTimeLeftMsTypeInParserProgress1660929127184';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parser_progress" ALTER COLUMN "time_left_ms" TYPE bigint`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parser_progress" ALTER COLUMN "time_left_ms" TYPE integer`,
    );
  }
}
