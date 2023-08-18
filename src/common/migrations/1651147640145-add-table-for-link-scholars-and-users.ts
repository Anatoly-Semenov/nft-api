import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTableForLinkScholarsAndUsers1651147640145
  implements MigrationInterface
{
  name = 'addTableForLinkScholarsAndUsers1651147640145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "analytics_users_user"
             (
                 "id"                    SERIAL  NOT NULL,
                 "analyticsUsers_userId" character varying NOT NULL,
                 "user_id"               integer NOT NULL,
                 CONSTRAINT "PK_09d606d03f4b0796f28ecbf0194" PRIMARY KEY ("id")
             )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "analytics_users_user"`);
  }
}
