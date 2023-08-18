import { AccountInfo, PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';

export type TokenAccount = {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
};
