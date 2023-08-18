import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPlayerStats1653457410379 implements MigrationInterface {
  name = 'addPlayerStats1653457410379';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_stats" DROP CONSTRAINT "FK_a14e90bda5a40cf0b150c6dc87f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stats" DROP CONSTRAINT "REL_a14e90bda5a40cf0b150c6dc87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stats" ADD CONSTRAINT "FK_a14e90bda5a40cf0b150c6dc87f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_stats" DROP CONSTRAINT "FK_a14e90bda5a40cf0b150c6dc87f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stats" ADD CONSTRAINT "REL_a14e90bda5a40cf0b150c6dc87" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stats" ADD CONSTRAINT "FK_a14e90bda5a40cf0b150c6dc87f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
