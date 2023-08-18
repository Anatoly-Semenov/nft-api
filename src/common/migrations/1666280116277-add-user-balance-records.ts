import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserBalanceRecords1666280116277 implements MigrationInterface {
  name = 'addUserBalanceRecords1666280116277';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_balance_record" ("id" SERIAL NOT NULL, "amount" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "PK_efc2fb7e753e73f229f3405ddb6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_balance_record" ADD CONSTRAINT "FK_23dfc468fb5a9829c84bed45332" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_balance_record" DROP CONSTRAINT "FK_23dfc468fb5a9829c84bed45332"`,
    );
    await queryRunner.query(`DROP TABLE "user_balance_record"`);
  }
}
