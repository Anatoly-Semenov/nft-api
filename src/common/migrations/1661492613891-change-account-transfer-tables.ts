import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeAccountTransferTables1661492613891
  implements MigrationInterface
{
  name = 'changeAccountTransferTables1661492613891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_transfer_aggregation" DROP COLUMN "parent_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."account_transfer_aggregation_parent_type_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."account_transfer_aggregation_parent_type_enum" AS ENUM('LOG', 'RECEIPT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_transfer_aggregation" ADD "parent_type" "public"."account_transfer_aggregation_parent_type_enum" NOT NULL`,
    );
  }
}
