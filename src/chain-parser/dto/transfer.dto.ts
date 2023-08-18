export class TransferDto {
  tokenContract: string;
  from: string;
  to: string;
  tokenId: string;
  amount: string;
  standard: string;
  transactionFrom: string;
  transactionTo: string;
  transactionHash: string;
  transactionCreatedAt: Date;
  gameId: number;
  blockNumber: number;
  method: string;
}
