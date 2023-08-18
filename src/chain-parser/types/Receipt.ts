import { Log } from './Log';

export type Receipt = {
  blockHash: string;
  blockNumber: number;
  contractAddress: string;
  cumulativeGasUsed: number;
  from: string;
  to: string;
  gasUsed: number;
  logs: Log[];
  logsBloom: string;
  status: boolean;
  transactionHash: string;
  transactionIndex: number;
  type: string;
  gameId: number;
  createdAt: Date;
  method: string;
};
