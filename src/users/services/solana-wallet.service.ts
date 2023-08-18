import { Injectable } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { sign } from 'tweetnacl';
import { decodeUTF8 } from 'tweetnacl-util';

@Injectable()
export class SolanaWalletService {
  validateAccount(account: string): boolean {
    try {
      new PublicKey(String(account));
    } catch (e) {
      return false;
    }

    return true;
  }

  verifySignature(
    account: string,
    message: string,
    signature: number[],
  ): boolean {
    return sign.detached.verify(
      decodeUTF8(message),
      new Uint8Array(signature),
      new PublicKey(account).toBytes(),
    );
  }
}
