import { TokenAccountInfo } from './TokenAccountInfo';
import { RawAccount } from '@solana/spl-token';

export type DecodedAccountInfo = {
  tokenAccountInfo: TokenAccountInfo;
  decodedAccountInfo: RawAccount;
};
