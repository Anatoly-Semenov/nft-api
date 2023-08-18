import { SolanaAssociatedTokenAccount } from '../entities/solana-associated-token-account.entity';
import { SolanaAccount } from '../entities/solana-account.entity';

export type GameTokenAddressObjectList = {
  associatedTokenAddressList: SolanaAssociatedTokenAccount[];
  accountAddressList: SolanaAccount[];
};
