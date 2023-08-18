import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { ParserConfigDto } from '../dto/parser-config.dto';

export const INPUT_BLACK_LIST = [
  'b88d4fde', // SafeTransferFrom
  'a22cb465', // SetApprovalForAll
  '42842e0e', // SafeTransferFrom || SetApprovalForAll - Cyball
  '23b872dd', // TransferFrom
  '095ea7b3', // Approve
  'a9059cbb', // Transfer
  'f242432a', // SafeTransferFrom
  '2eb2c2d6', // SafeBatchTransferFrom
];

@Injectable()
export class RawTransactionService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async getMinByGame(config: ParserConfigDto) {
    const { knownNftAddresses, gameAddresses } = config;

    const rawTrx = await this.connection
      .createQueryBuilder()
      .select('MIN(block_number) AS min')
      .from('transactions_bsc', 't')
      .where('t.address_to IN (:...contractList)')
      .setParameters({
        contractList: [...knownNftAddresses, ...gameAddresses],
      })
      .getRawOne();

    return rawTrx?.min || 0;
  }
}
