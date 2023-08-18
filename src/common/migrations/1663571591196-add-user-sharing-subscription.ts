import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserSharingSubscription1663571591196
  implements MigrationInterface
{
  name = 'addUserSharingSubscription1663571591196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_sharing_subscription" ("id" SERIAL NOT NULL, "expiredAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_c3b5d0e5c592081dad0920fa12" UNIQUE ("userId"), CONSTRAINT "PK_b7c0ec3a413098173582ebfb4fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sharing_subscription" ADD CONSTRAINT "FK_c3b5d0e5c592081dad0920fa126" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_sharing_subscription" DROP CONSTRAINT "FK_c3b5d0e5c592081dad0920fa126"`,
    );
    await queryRunner.query(`DROP TABLE "user_sharing_subscription"`);
  }
}
