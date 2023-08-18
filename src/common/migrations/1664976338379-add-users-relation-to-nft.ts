import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUsersRelationToNft1664976338379 implements MigrationInterface {
  name = 'addUsersRelationToNft1664976338379';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_claimed_nfts_nft" DROP CONSTRAINT "FK_6a3aafd263a85419d91f88a3d19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_claimed_nfts_nft" ADD CONSTRAINT "FK_6a3aafd263a85419d91f88a3d19" FOREIGN KEY ("nftId") REFERENCES "nft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_claimed_nfts_nft" DROP CONSTRAINT "FK_6a3aafd263a85419d91f88a3d19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_claimed_nfts_nft" ADD CONSTRAINT "FK_6a3aafd263a85419d91f88a3d19" FOREIGN KEY ("nftId") REFERENCES "nft"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
