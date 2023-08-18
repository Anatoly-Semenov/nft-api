import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeAccountTransferTables1661490907357
  implements MigrationInterface
{
  name = 'changeAccountTransferTables1661490907357';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_transfer_contract" ADD "parsing_stage" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer_contract" RENAME TO "account_transfer"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_06eecfafb974ddb84afeafdba2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_552d66c913724ae84965655d68"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_abec389bacca8b3d4237247b0c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bc11dfbb9b06be81bbeea13484"`,
    );
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "account_transfer_id_seq" OWNED BY "account_transfer"."id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer" ALTER COLUMN "id" SET DEFAULT nextval('"account_transfer_id_seq"')`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18da65fdb3fae1aa2c756fa186" ON "account_transfer" ("from_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe5a6c30f70052643eae2559a6" ON "account_transfer" ("to_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e7de4206797919ab9071977063" ON "account_transfer" ("game_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2b6ba4d3dd3be4a8bb35c52834" ON "account_transfer" ("transaction_hash") `,
    );
    await queryRunner.query(`DROP TABLE "public"."account_transfer_token"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2b6ba4d3dd3be4a8bb35c52834"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e7de4206797919ab9071977063"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe5a6c30f70052643eae2559a6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_18da65fdb3fae1aa2c756fa186"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer" ALTER COLUMN "id" SET DEFAULT nextval('account_transfer_contract_id_seq')`,
    );
    await queryRunner.query(`DROP SEQUENCE "account_transfer_id_seq"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_bc11dfbb9b06be81bbeea13484" ON "account_transfer" ("transaction_hash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_abec389bacca8b3d4237247b0c" ON "account_transfer" ("game_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_552d66c913724ae84965655d68" ON "account_transfer" ("to_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_06eecfafb974ddb84afeafdba2" ON "account_transfer" ("from_account_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer" RENAME TO "account_transfer_contract"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer_contract" DROP COLUMN "parsing_stage"`,
    );
  }
}
