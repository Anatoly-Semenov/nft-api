import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserWalletTable1659338542574 implements MigrationInterface {
  name = 'addUserWalletTable1659338542574';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_wallet" ("id" SERIAL NOT NULL, "wallet" character varying NOT NULL, "is_verified" boolean NOT NULL DEFAULT false, "updated_ad" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "UQ_e060c9df0322e2bffe66c588edd" UNIQUE ("wallet"), CONSTRAINT "PK_b453ec3d9d579f6b9699be98beb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_wallet" ADD CONSTRAINT "FK_f470cbcba8c6dbdaf32ac0d4267" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_wallet" DROP CONSTRAINT "FK_f470cbcba8c6dbdaf32ac0d4267"`,
    );
    await queryRunner.query(`DROP TABLE "user_wallet"`);
  }
}
