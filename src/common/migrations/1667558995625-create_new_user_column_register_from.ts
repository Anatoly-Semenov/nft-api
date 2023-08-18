import { MigrationInterface, QueryRunner } from 'typeorm';

export class createNewUserColumnRegisterFrom1667558995625
  implements MigrationInterface
{
  name = 'createNewUserColumnRegisterFrom1667558995625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_register_from_enum" AS ENUM('MAIN_SITE', 'MESSENGER_SITE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "register_from" "public"."user_register_from_enum" NOT NULL DEFAULT 'MAIN_SITE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "register_from"`);
    await queryRunner.query(`DROP TYPE "public"."user_register_from_enum"`);
  }
}
