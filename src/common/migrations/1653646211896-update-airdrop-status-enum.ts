import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateAirdropStatusEnum1653646211896
  implements MigrationInterface
{
  name = 'updateAirdropStatusEnum1653646211896';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."airdrop_status_enum" AS ENUM('WHITELIST_STARTS', 'WHITELIST_ENDS', 'CLAIM_STARTS', 'CLAIM_ENDS')`,
    );
    await queryRunner.query(
      `ALTER TABLE "airdrop" ADD "status" "public"."airdrop_status_enum" NOT NULL DEFAULT 'WHITELIST_STARTS'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "airdrop" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."airdrop_status_enum"`);
  }
}
