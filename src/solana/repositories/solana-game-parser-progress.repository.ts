import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolanaGameParserProgress } from '../entities/solana-game-parser-progress.entity';

export const SOLANA_GAME_PARSER_PROGRESS_REPOSITORY_SERVICE_NAME =
  'SOLANA_GAME_PARSER_PROGRESS_REPOSITORY';

@Injectable()
export class SolanaGameParserProgressRepository {
  constructor(
    @InjectRepository(SolanaGameParserProgress)
    private readonly repository: Repository<SolanaGameParserProgress>,
  ) {}

  async findGameForParsing(): Promise<SolanaGameParserProgress | undefined> {
    const gameListSettings = await this.repository.find();

    let gameSettings = gameListSettings.find(
      (g) => g.aggregation_method_number > 0,
    );
    if (gameSettings) {
      return gameSettings;
    }

    gameSettings = gameListSettings.find((g) => g.method_number > 0);
    if (gameSettings) {
      return gameSettings;
    }

    const minActivityNumber = Math.min(
      ...gameListSettings.map((g) => g.activity_number),
    );

    return gameListSettings.find(
      (g) => g.activity_number === minActivityNumber,
    );
  }

  save(entity: SolanaGameParserProgress): Promise<SolanaGameParserProgress> {
    return this.repository.save(entity);
  }
}
