import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameField1651486917785 implements MigrationInterface {
  name = 'renameField1651486917785';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analytics_player_user" RENAME COLUMN "playerId" TO "userId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analytics_player_user" RENAME COLUMN "userId" TO "playerId"`,
    );
  }
}
