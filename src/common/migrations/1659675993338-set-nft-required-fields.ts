import { MigrationInterface, QueryRunner } from 'typeorm';

export class setNftRequiredFields1659675993338 implements MigrationInterface {
  name = 'setNftRequiredFields1659675993338';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft" ALTER COLUMN "image" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft" ALTER COLUMN "image" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft" ALTER COLUMN "description" DROP NOT NULL`,
    );
  }
}
