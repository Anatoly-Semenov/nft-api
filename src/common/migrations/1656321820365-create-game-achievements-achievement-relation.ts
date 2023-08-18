import { MigrationInterface, QueryRunner } from 'typeorm';

export class createGameAchievementsAchievementRelation1656321820365
  implements MigrationInterface
{
  name = 'createGameAchievementsAchievementRelation1656321820365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_stats" RENAME COLUMN "game" TO "gameId"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."player_stats_game_enum" RENAME TO "player_stats_gameid_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "achievement" RENAME COLUMN "game" TO "gameId"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."achievement_game_enum" RENAME TO "achievement_gameid_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD "is_on_chain" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(`ALTER TABLE "game" ADD "playerStatsId" integer`);
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "UQ_35e3406e794d2ba2f551384f903" UNIQUE ("playerStatsId")`,
    );
    await queryRunner.query(`ALTER TABLE "player_stats" DROP COLUMN "gameId"`);
    await queryRunner.query(`ALTER TABLE "player_stats" ADD "gameId" integer`);
    await queryRunner.query(
      `ALTER TABLE "player_stats" ADD CONSTRAINT "UQ_dda32e4af0ba81ca82ac5379578" UNIQUE ("gameId")`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."game_code_enum" RENAME TO "game_code_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."game_code_enum" AS ENUM('BOMB_CRYPTO', 'AXIE_INFINITY', 'PEGAXY', 'CYBALL', 'METAGEAR', 'DRUNK_ROBOTS', 'FORTNITE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "code" TYPE "public"."game_code_enum" USING "code"::"text"::"public"."game_code_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."game_code_enum_old"`);
    await queryRunner.query(`ALTER TABLE "achievement" DROP COLUMN "gameId"`);
    await queryRunner.query(`ALTER TABLE "achievement" ADD "gameId" integer`);
    await queryRunner.query(
      `ALTER TABLE "player_stats" ADD CONSTRAINT "FK_dda32e4af0ba81ca82ac5379578" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_35e3406e794d2ba2f551384f903" FOREIGN KEY ("playerStatsId") REFERENCES "player_stats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "achievement" ADD CONSTRAINT "FK_8ff9fb55f1302a3219f1842d687" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    const [{ max: lastGameId }] = await queryRunner.query(
      `SELECT MAX(id) FROM "public"."game";`,
    );

    const gameId = (lastGameId as number) + 1;

    const [{ id: fortniteGameId }] = await queryRunner.query(
      `INSERT INTO "public"."game" (
        id,
        title, 
        min_investment_token, 
        token_title, 
        release_date, 
        chain_title, 
        description, 
        in_use,site, 
        image, 
        is_upcoming, 
        logo, 
        code, 
        genre, 
        "additionalInfoId", 
        is_on_chain
      ) VALUES (
        ${gameId},
        'Fortnite', 
        0, 
        'USD', 
        '2021-01-01', 
        'bsc', 
        'Fortnite is a free-to-play Battle Royale game with numerous game modes for every type of game player. Watch a concert, build an island or fight.', 
        true, 
        'https://www.epicgames.com/fortnite/en-US/home', 
        'https://gamingintel.com/wp-content/uploads/2022/06/Fortnite-v21.10-all-leaks-naruto-skins-lightsabers-more.jpg.webp', 
        false, 
        NULL, 
        'FORTNITE', 
        NULL, 
        NULL, 
        false
      ) RETURNING(id);`,
    );

    await queryRunner.query(
      `UPDATE "public"."achievement" SET "gameId" = '${fortniteGameId}' WHERE "gameId" IS NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [game] = await queryRunner.query(
      `SELECT id FROM "public"."game" WHERE code = 'FORTNITE'`,
    );

    await queryRunner.query(
      `UPDATE "public"."achievement" SET "gameId" = NULL WHERE "gameId" = '${game.id}';`,
    );

    await queryRunner.query(
      `DELETE FROM "public"."game" WHERE id = '${game.id}'`,
    );

    await queryRunner.query(
      `ALTER TABLE "achievement" DROP CONSTRAINT "FK_8ff9fb55f1302a3219f1842d687"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_35e3406e794d2ba2f551384f903"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stats" DROP CONSTRAINT "FK_dda32e4af0ba81ca82ac5379578"`,
    );
    await queryRunner.query(`ALTER TABLE "achievement" DROP COLUMN "gameId"`);
    await queryRunner.query(
      `ALTER TABLE "achievement" ADD "gameId" "public"."achievement_gameid_enum" NOT NULL DEFAULT 'fortnite'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."game_code_enum_old" AS ENUM('BOMB_CRYPTO', 'AXIE_INFINITY', 'PEGAXY', 'CYBALL', 'METAGEAR', 'DRUNK_ROBOTS')`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "code" TYPE "public"."game_code_enum_old" USING "code"::"text"::"public"."game_code_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."game_code_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."game_code_enum_old" RENAME TO "game_code_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stats" DROP CONSTRAINT "UQ_dda32e4af0ba81ca82ac5379578"`,
    );
    await queryRunner.query(`ALTER TABLE "player_stats" DROP COLUMN "gameId"`);
    await queryRunner.query(
      `ALTER TABLE "player_stats" ADD "gameId" "public"."player_stats_gameid_enum" NOT NULL DEFAULT 'fortnite'`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "UQ_35e3406e794d2ba2f551384f903"`,
    );
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "playerStatsId"`);
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "is_on_chain"`);
    await queryRunner.query(
      `ALTER TYPE "public"."achievement_gameid_enum" RENAME TO "achievement_game_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "achievement" RENAME COLUMN "gameId" TO "game"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."player_stats_gameid_enum" RENAME TO "player_stats_game_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stats" RENAME COLUMN "gameId" TO "game"`,
    );
  }
}
