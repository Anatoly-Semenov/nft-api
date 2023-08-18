import { Expose, Type } from 'class-transformer';
import { GameContractTypeEnum } from '../enums/game-contract-type.enum';

export class AccountTransferAggregationDto {
  @Type(() => Number)
  id: number;

  @Expose({ name: 'main_account_id' })
  @Type(() => String)
  mainAccountId: string;

  @Expose({ name: 'second_account_id' })
  @Type(() => String)
  secondAccountId: string;

  @Expose({ name: 'main_address' })
  @Type(() => String)
  mainAddress: string;

  @Expose({ name: 'second_address' })
  @Type(() => String)
  secondAddress: string;

  @Expose({ name: 'main_first_time' })
  @Type(() => Date)
  mainFirstTime: Date;

  @Expose({ name: 'second_first_time' })
  @Type(() => Date)
  secondFirstTime: Date;

  @Expose({ name: 'is_contract' })
  @Type(() => Boolean)
  isContract: boolean;

  @Expose({ name: 'token_contract_id' })
  @Type(() => Number)
  tokenContractId: number;

  @Expose({ name: 'token_contract_address' })
  @Type(() => String)
  tokenContractAddress: string;

  @Expose({ name: 'token_contract_title' })
  @Type(() => String)
  tokenContractTitle: string;

  @Expose({ name: 'token_price' })
  @Type(() => Number)
  tokenPrice: number;

  @Type(() => String)
  amount: string;

  @Expose({ name: 'game_id' })
  @Type(() => Number)
  gameId: number;

  @Expose({ name: 'game_contract_type' })
  @Type(() => String)
  gameContractType: GameContractTypeEnum;

  @Expose({ name: 'transaction_hash' })
  @Type(() => String)
  transactionHash: string;

  @Expose({ name: 'transaction_contract' })
  @Type(() => String)
  transactionContract: string;

  @Expose({ name: 'block_number' })
  @Type(() => Number)
  blockNumber: number;

  @Expose({ name: 'created_at' })
  @Type(() => Date)
  createdAt: Date;

  constructor(partial?: Partial<AccountTransferAggregationDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
