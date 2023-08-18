import { MigrationInterface, QueryRunner } from 'typeorm';

export class initNftsModule1653372577760 implements MigrationInterface {
  name = 'initNftsModule1653372577760';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."achievement_game_enum" AS ENUM('fortnite')`,
    );
    await queryRunner.query(
      `CREATE TABLE "achievement" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "game" "public"."achievement_game_enum" NOT NULL DEFAULT 'fortnite', "rules" text NOT NULL DEFAULT '[]', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_441339f40e8ce717525a381671e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nft" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "image" character varying, "scores" integer NOT NULL DEFAULT '1', "expiredAt" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8f46897c58e23b0e7bf6c8e56b0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."player_stats_game_enum" AS ENUM('fortnite')`,
    );
    await queryRunner.query(
      `CREATE TABLE "player_stats" ("id" SERIAL NOT NULL, "game" "public"."player_stats_game_enum" NOT NULL DEFAULT 'fortnite', "result" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_a14e90bda5a40cf0b150c6dc87" UNIQUE ("userId"), CONSTRAINT "PK_22e2d8ec820a98efbfdbf84d925" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "game_info_aggregated" DROP CONSTRAINT "UQ_800dafbb45033f893545439f359"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stats" ADD CONSTRAINT "FK_a14e90bda5a40cf0b150c6dc87f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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

  public async down(queryRunner: QueryRunner): Promise<void> {
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
    await queryRunner.query(
      `ALTER TABLE "player_stats" DROP CONSTRAINT "FK_a14e90bda5a40cf0b150c6dc87f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" ADD CONSTRAINT "UQ_800dafbb45033f893545439f359" UNIQUE ("game_id")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6a3aafd263a85419d91f88a3d1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7f7343006318bb200e66f710dd"`,
    );
    await queryRunner.query(`DROP TABLE "user_claimed_nfts_nft"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7e9948f0526458116eba66c0e9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_60fb4639cd518a5c6cdd345e16"`,
    );
    await queryRunner.query(`DROP TABLE "nft_achievements_achievement"`);
    await queryRunner.query(`DROP TABLE "player_stats"`);
    await queryRunner.query(`DROP TYPE "public"."player_stats_game_enum"`);
    await queryRunner.query(`DROP TABLE "nft"`);
    await queryRunner.query(`DROP TABLE "achievement"`);
    await queryRunner.query(`DROP TYPE "public"."achievement_game_enum"`);
  }
}
