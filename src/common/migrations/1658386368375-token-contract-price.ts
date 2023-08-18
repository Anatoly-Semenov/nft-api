import { MigrationInterface, QueryRunner } from 'typeorm';

export class tokenContractPrice1658386368375 implements MigrationInterface {
  name = 'tokenContractPrice1658386368375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "token_contract_price" ("id" SERIAL NOT NULL, "price" double precision NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "token_contract_id" integer NOT NULL, PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "token_contract_price" ADD CONSTRAINT "token-price-row" UNIQUE ("token_contract_id", "created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "token_contract_price" DROP CONSTRAINT "token-price-row"`,
    );
    await queryRunner.query(`DROP TABLE "token_contract_price"`);
  }
}
