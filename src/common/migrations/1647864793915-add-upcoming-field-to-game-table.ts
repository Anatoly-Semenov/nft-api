import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUpcomingFieldToGameTable1647864793915
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // language=PostgreSQL
    queryRunner.query(
      `ALTER TABLE game
                ADD is_upcoming boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropColumn('game', 'is_upcoming');
  }
}
