export class GameForParsingDto {
  readonly gameId: number;
  readonly gameTitle: string;
  readonly progressStatus: string;

  constructor(partial?: Partial<GameForParsingDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
