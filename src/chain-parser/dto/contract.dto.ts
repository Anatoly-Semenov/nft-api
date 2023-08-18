export class ContractDto {
  readonly id: number;
  readonly gameId: number;
  readonly address: string;
  readonly title: string;
  readonly isCoin: boolean;

  constructor(partial?: Partial<ContractDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
