import { MigrationInterface, QueryRunner } from 'typeorm';

export class createReferralTable1669032409830 implements MigrationInterface {
  name = 'createReferralTable1669032409830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "referral" ("id" SERIAL NOT NULL, "new_user_id" integer NOT NULL, "sender_id" integer, CONSTRAINT "UQ_2c685385f4b651a9f43a7a9ac87" UNIQUE ("new_user_id"), CONSTRAINT "REL_2c685385f4b651a9f43a7a9ac8" UNIQUE ("new_user_id"), CONSTRAINT "PK_a2d3e935a6591168066defec5ad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral" ADD CONSTRAINT "FK_fe6bfe6fcace749df071d46372f" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral" ADD CONSTRAINT "FK_2c685385f4b651a9f43a7a9ac87" FOREIGN KEY ("new_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "referral" DROP CONSTRAINT "FK_2c685385f4b651a9f43a7a9ac87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral" DROP CONSTRAINT "FK_fe6bfe6fcace749df071d46372f"`,
    );

    await queryRunner.query(`DROP TABLE "referral"`);
  }
}
