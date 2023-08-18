import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTablesNameAndAddIndexes1661247500418
  implements MigrationInterface
{
  name = 'changeTablesNameAndAddIndexes1661247500418';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_83d6c25395e6c28ceacb543f0b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_36ad3d2d97dae0ec0f386346be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_de63f887cb00b318f73aa8471f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0398dcc260fa31bbfba9ce5825"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc3ebebcf59b752750c1d0110f"`,
    );
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "account_transfer_token_id_seq" OWNED BY "account_transfer_token"."id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer_token" ALTER COLUMN "id" SET DEFAULT nextval('"account_transfer_token_id_seq"')`,
    );
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "account_transfer_contract_id_seq" OWNED BY "account_transfer_contract"."id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer_contract" ALTER COLUMN "id" SET DEFAULT nextval('"account_transfer_contract_id_seq"')`,
    );
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "account_transfer_aggregation_id_seq" OWNED BY "account_transfer_aggregation"."id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer_aggregation" ALTER COLUMN "id" SET DEFAULT nextval('"account_transfer_aggregation_id_seq"')`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_transaction_aggregation_game_contract_type_enum" RENAME TO "user_transaction_aggregation_game_contract_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."account_transfer_aggregation_game_contract_type_enum" AS ENUM('MARKETPLACE', 'GAME', 'ETC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer_aggregation" ALTER COLUMN "game_contract_type" TYPE "public"."account_transfer_aggregation_game_contract_type_enum" USING "game_contract_type"::"text"::"public"."account_transfer_aggregation_game_contract_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_transaction_aggregation_game_contract_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_transaction_aggregation_parent_type_enum" RENAME TO "user_transaction_aggregation_parent_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."account_transfer_aggregation_parent_type_enum" AS ENUM('LOG', 'RECEIPT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer_aggregation" ALTER COLUMN "parent_type" TYPE "public"."account_transfer_aggregation_parent_type_enum" USING "parent_type"::"text"::"public"."account_transfer_aggregation_parent_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_transaction_aggregation_parent_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a8aa95aeedbcf11cfcb224b688" ON "account_transfer_token" ("from_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0c5f28b6c6f74520abbd3315e8" ON "account_transfer_token" ("to_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_40529229012ff9d8e57e53efa1" ON "account_transfer_token" ("game_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_62879db8ebcf8fd48ad09b76db" ON "account_transfer_token" ("transaction_hash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_83603c168bc00b20544539fbea" ON "account" ("address") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_06eecfafb974ddb84afeafdba2" ON "account_transfer_contract" ("from_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_552d66c913724ae84965655d68" ON "account_transfer_contract" ("to_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_abec389bacca8b3d4237247b0c" ON "account_transfer_contract" ("game_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bc11dfbb9b06be81bbeea13484" ON "account_transfer_contract" ("transaction_hash") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bc11dfbb9b06be81bbeea13484"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_abec389bacca8b3d4237247b0c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_552d66c913724ae84965655d68"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_06eecfafb974ddb84afeafdba2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_83603c168bc00b20544539fbea"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_62879db8ebcf8fd48ad09b76db"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_40529229012ff9d8e57e53efa1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0c5f28b6c6f74520abbd3315e8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a8aa95aeedbcf11cfcb224b688"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_transaction_aggregation_parent_type_enum_old" AS ENUM('LOG', 'RECEIPT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer_aggregation" ALTER COLUMN "parent_type" TYPE "public"."user_transaction_aggregation_parent_type_enum_old" USING "parent_type"::"text"::"public"."user_transaction_aggregation_parent_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."account_transfer_aggregation_parent_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_transaction_aggregation_parent_type_enum_old" RENAME TO "user_transaction_aggregation_parent_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_transaction_aggregation_game_contract_type_enum_old" AS ENUM('MARKETPLACE', 'GAME', 'ETC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer_aggregation" ALTER COLUMN "game_contract_type" TYPE "public"."user_transaction_aggregation_game_contract_type_enum_old" USING "game_contract_type"::"text"::"public"."user_transaction_aggregation_game_contract_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."account_transfer_aggregation_game_contract_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_transaction_aggregation_game_contract_type_enum_old" RENAME TO "user_transaction_aggregation_game_contract_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer_aggregation" ALTER COLUMN "id" SET DEFAULT nextval('user_transaction_aggregation_id_seq')`,
    );
    await queryRunner.query(
      `DROP SEQUENCE "account_transfer_aggregation_id_seq"`,
    );
    await queryRunner.query(`DROP SEQUENCE "account_transfer_contract_id_seq"`);
    await queryRunner.query(
      `ALTER TABLE "account_transfer_token" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(`DROP SEQUENCE "account_transfer_token_id_seq"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_dc3ebebcf59b752750c1d0110f" ON "account_transfer_contract" ("game_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0398dcc260fa31bbfba9ce5825" ON "account_transfer_contract" ("from_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_de63f887cb00b318f73aa8471f" ON "account_transfer_contract" ("to_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_36ad3d2d97dae0ec0f386346be" ON "account_transfer_token" ("from_account_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_83d6c25395e6c28ceacb543f0b" ON "account_transfer_token" ("to_account_id") `,
    );
  }
}
