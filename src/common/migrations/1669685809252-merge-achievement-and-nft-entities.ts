import { MigrationInterface, QueryRunner } from 'typeorm';

export class mergeAchivementAndNft1669685809252 implements MigrationInterface {
  name = 'mergeAchivementAndNft1669685809252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "achievement" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "achievement" ALTER COLUMN "name" SET DEFAULT 'Untitled'`,
    );
    await queryRunner.query(
      `ALTER TABLE "achievement" ADD "description" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "achievement" ADD "image" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "achievement" ADD "chain" character varying`,
    );

    await queryRunner.query(`
      UPDATE
        achievement a
      SET
        (name,
          description,
          image,
          chain) = (
          SELECT
            name,
            "shortDescription" as description,
            image,
            chain
          FROM
            nft n
          WHERE
            a.id = n.id)
      `);

    await queryRunner.query(
      `DROP INDEX "public"."IDX_7e9948f0526458116eba66c0e9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_60fb4639cd518a5c6cdd345e16"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6a3aafd263a85419d91f88a3d1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7f7343006318bb200e66f710dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_claimed_nfts_nft" DROP CONSTRAINT "FK_6a3aafd263a85419d91f88a3d19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_claimed_nfts_nft" DROP CONSTRAINT "FK_7f7343006318bb200e66f710ddd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_achievements_achievement" DROP CONSTRAINT "FK_7e9948f0526458116eba66c0e97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_achievements_achievement" DROP CONSTRAINT "FK_60fb4639cd518a5c6cdd345e166"`,
    );
    await queryRunner.query(`DROP TABLE "nft_achievements_achievement"`);
    await queryRunner.query(`DROP TABLE "nft"`);
    await queryRunner.query(`DROP TABLE "user_claimed_nfts_nft"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "achievement" DROP COLUMN "chain"`);
    await queryRunner.query(`ALTER TABLE "achievement" DROP COLUMN "image"`);
    await queryRunner.query(
      `ALTER TABLE "achievement" DROP COLUMN "description"`,
    );

    await queryRunner.query(
      `CREATE TABLE "nft" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "image" character varying, "scores" integer NOT NULL DEFAULT '1', "count" int4 NOT NULL DEFAULT 1, "shortDescription" varchar, "chain" varchar, "expiredAt" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8f46897c58e23b0e7bf6c8e56b0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nft_achievements_achievement" ("nftId" integer NOT NULL, "achievementId" integer NOT NULL, CONSTRAINT "PK_12cf1fea5f9435447db7a876d68" PRIMARY KEY ("nftId", "achievementId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_60fb4639cd518a5c6cdd345e16" ON "nft_achievements_achievement" ("nftId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7e9948f0526458116eba66c0e9" ON "nft_achievements_achievement" ("achievementId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_claimed_nfts_nft" ("userId" integer NOT NULL, "nftId" integer NOT NULL, CONSTRAINT "PK_923d0e9e691e396a2499502d263" PRIMARY KEY ("userId", "nftId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7f7343006318bb200e66f710dd" ON "user_claimed_nfts_nft" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6a3aafd263a85419d91f88a3d1" ON "user_claimed_nfts_nft" ("nftId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_achievements_achievement" ADD CONSTRAINT "FK_60fb4639cd518a5c6cdd345e166" FOREIGN KEY ("nftId") REFERENCES "nft"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_achievements_achievement" ADD CONSTRAINT "FK_7e9948f0526458116eba66c0e97" FOREIGN KEY ("achievementId") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_claimed_nfts_nft" ADD CONSTRAINT "FK_7f7343006318bb200e66f710ddd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_claimed_nfts_nft" ADD CONSTRAINT "FK_6a3aafd263a85419d91f88a3d19" FOREIGN KEY ("nftId") REFERENCES "nft"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
