import { Connection } from 'typeorm';
import { GameInfoAggregatedDto } from './dto/game-info-aggregated.dto';
import { GameInfoAggregated } from './entities/game-info-aggregated.entity';

export namespace GamesUtils {
  export const upsertGameInfo = async (
    { id: _id, ...gameInfo }: GameInfoAggregatedDto,
    connection: Connection,
  ): Promise<void> => {
    // @todo: Temporary solution to fix Infinity value.
    gameInfo.monthly_return_token = Number.isFinite(
      gameInfo.monthly_return_token,
    )
      ? gameInfo.monthly_return_token
      : null;

    // @todo: Temporary solution to fix Infinity value.
    gameInfo.monthly_return_usd = Number.isFinite(gameInfo.monthly_return_usd)
      ? gameInfo.monthly_return_usd
      : null;

    await connection.manager
      .upsert(GameInfoAggregated, [gameInfo], ['game_id'])
      .catch((err: Error) => {
        console.error(err);

        throw err;
      });
  };
}
