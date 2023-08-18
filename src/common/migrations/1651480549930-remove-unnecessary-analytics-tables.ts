import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeUnnecessaryAnalyticsTables1651480549930
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "analytics_clients_game"`);
    await queryRunner.query(`DROP TABLE "analytics_users_user"`);
    await queryRunner.query(`DROP TABLE "analytics_users"`);
    await queryRunner.query(`DROP TABLE "analytics_events"`);
    await queryRunner.query(`DROP TABLE "analytics_clients"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('');
  }
}
