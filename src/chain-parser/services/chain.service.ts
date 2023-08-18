import { Injectable } from '@nestjs/common';
import { TransferDto } from '../dto/transfer.dto';
import { TokenStandard } from '../enums/token-standard.enum';
import { ContractService } from './contract.service';
import { Log } from '../types/Log';
import { GameTransaction } from '../entities/game-transaction.entity';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { CustomWeb3ClientService } from './custom-web3-client.service';

const NODE_URL =
  'https://misty-quiet-smoke.bsc.quiknode.pro/a6898e74758e97a47d35eabb2a57e20d725db736/';

const TRANSFER_TOPIC_BEP20 =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const TRANSFER_TOPIC_MULTIPLE_ERC1155 =
  '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb';
const TRANSFER_TOPIC_SINGLE_ERC1155 =
  '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

const TRANSFERS_20 = [TRANSFER_TOPIC_BEP20];
const TRANSFERS_1155 = [
  TRANSFER_TOPIC_MULTIPLE_ERC1155,
  TRANSFER_TOPIC_SINGLE_ERC1155,
];
const TRANSFER_TOPICS_ALL = [...TRANSFERS_20, ...TRANSFERS_1155];

@Injectable()
export class ChainService {
  constructor(private customWeb3Client: CustomWeb3ClientService) {
    this.customWeb3Client.setNodeUrl(NODE_URL);
  }

  private static explodeTransferDataStringToArray(dataStr: string): string[] {
    const result = [];
    const len = 64;

    const str = dataStr.substring(2, dataStr.length);

    let i = 0;
    let part;
    while ((part = str.substring(i * len, (i + 1) * len)) && part != '') {
      i++;
      result.push(part);
    }

    return result;
  }

  private static mapInternalToTransfer(internal: any, trx: GameTransaction) {
    const result = new TransferDto();
    result.gameId = trx.gameId;
    result.method = trx.input;
    result.to = internal?.action?.to;
    result.from = internal?.action?.from;
    result.blockNumber = trx.blockNumber;
    result.transactionTo = trx.addressTo;
    result.transactionFrom = trx.addressFrom;
    result.transactionHash = trx.transactionHash;
    result.transactionCreatedAt = trx.createdAt;
    result.amount = parseInt(internal?.action?.value, 16)?.toString();
    result.tokenContract = ContractService.getDefaultChainCoin('BSC');

    return result;
  }

  private static filterInternal(transactions: any[]) {
    let result = transactions.filter(
      (item) => item?.action.callType === 'call',
    );

    result = result.filter((item) => '0x0' !== item.action.value.toLowerCase());

    return result;
  }

  async tokensHash(config: ParserConfigDto, start, end): Promise<string[]> {
    const { gameId, knownNftAddresses } = config;

    // noinspection DuplicatedCode
    const threadsCount = 100;

    const step = (end - start) / threadsCount;
    const iterations = [];

    for (let i = 0; i < threadsCount; i++) {
      const from = Math.round(start + i * step) + i;
      const to = Math.round(start + (i + 1) * step) + i;
      iterations.push({
        from: i === 0 ? start : from,
        to: to > end ? end : to,
      });
    }

    const logsList = [];
    await Promise.all(
      iterations.map(async (item) => {
        const { from, to } = item;
        const res = await this.getTokenLogsThread(knownNftAddresses, from, to);
        logsList.push(...res);
      }),
    );

    const container = {};

    logsList.forEach((item) => {
      const hash = item.transactionHash;
      container[hash] = this.mapLogToTransaction(item, gameId);
    });

    const allTransactions: GameTransaction[] = Object.values(container);
    return allTransactions.map((obj) => obj.transactionHash);
  }

  async walletsHash(config: ParserConfigDto, from, to) {
    const { coinAddresses, commonCoinAddresses, walletAddresses } = config;
    const coins = [...coinAddresses];
    if (!walletAddresses.includes(NULL_ADDRESS)) {
      coins.push(...commonCoinAddresses);
    }

    // noinspection DuplicatedCode
    const threadsCount = 100;

    const step = (to - from) / threadsCount;
    const iterations = [];

    for (let i = 0; i < threadsCount; i++) {
      const fromBlock = Math.round(from + i * step) + i;
      const toBlock = Math.round(from + (i + 1) * step) + i;
      iterations.push({
        from: i === 0 ? from : fromBlock,
        to: toBlock > to ? to : toBlock,
      });
    }

    const logsList = [];
    await Promise.all(
      iterations.map(async (item) => {
        const { from, to } = item;
        const res = await this.getNftLogsThread(
          coins,
          walletAddresses,
          from,
          to,
        );
        logsList.push(...res);
      }),
    );

    const container = {};

    logsList.forEach((item) => {
      const hash = item.transactionHash;
      const transfers = this.mapLogToTransferDto(item);

      if (transfers.length > 0) {
        transfers[0].gameId = config.gameId;
        container[hash] = transfers[0];
      }
    });

    const allTransactions: TransferDto[] = Object.values(container);
    return allTransactions.map((obj) => obj.transactionHash);
  }

  /**
   * Get all transfers for founded transactions
   *
   * @param transactions: Transaction[]
   * @return Promise<TransferDto[]>
   */
  async getTrxListTransfers(
    transactions: GameTransaction[],
  ): Promise<TransferDto[]> {
    const arr = await Promise.all(
      transactions.map(async (transaction) =>
        this.getTransactionTransfers(transaction),
      ),
    );

    return arr.reduce((prev, cur) => [...prev, ...cur], []);
  }

  private async getTransactionTransfers(
    transaction: GameTransaction,
  ): Promise<TransferDto[]> {
    const hash = transaction.transactionHash;
    const execute = [this.customWeb3Client.getTransactionReceipt(hash)];

    if (transaction.grabInternal) {
      execute.push(this.customWeb3Client.getInternalTransactions(hash));
    }

    const [receipt, internalList] = await Promise.all(execute);

    const transfers = [];
    let internalTransfers = [];

    this.filterLogs(receipt.logs).forEach((item) => {
      transfers.push(...this.mapLogToTransferDto(item, transaction));
    });

    if (internalList && internalList.length > 0) {
      const intTransactions = ChainService.filterInternal(internalList);

      if (intTransactions.length > 0) {
        internalTransfers = intTransactions.map((item) =>
          ChainService.mapInternalToTransfer(item, transaction),
        );
      }
    }

    return [...transfers, ...internalTransfers];
  }

  private mapLogToTransaction(log: Log, gameId?: number): GameTransaction {
    const result = new GameTransaction();
    result.gameId = gameId;
    result.blockNumber = this.customWeb3Client.hexToNumber(log.blockNumber);
    result.transactionHash = log.transactionHash;
    result.grabInternal = false;

    return result;
  }

  private async getTokenLogsThread(contracts, from, to): Promise<Log[]> {
    return await this.customWeb3Client.ethGetLogs(contracts, from, to, [
      TRANSFER_TOPICS_ALL,
    ]);
  }

  private async getNftLogsThread(
    coins: string[],
    wallets: string[],
    from: number,
    to: number,
  ): Promise<Log[]> {
    const bep20FromTopics = [
      TRANSFERS_20,
      wallets.map((item) =>
        this.customWeb3Client.encodeParameter('address', item),
      ),
    ];

    const bep20ToTopics = [
      TRANSFERS_20,
      [],
      wallets.map((item) =>
        this.customWeb3Client.encodeParameter('address', item),
      ),
    ];

    const erc1155FromTopics = [
      TRANSFERS_1155,
      [],
      wallets.map((item) =>
        this.customWeb3Client.encodeParameter('address', item),
      ),
    ];

    const erc1155ToTopics = [
      TRANSFERS_1155,
      [],
      [],
      wallets.map((item) =>
        this.customWeb3Client.encodeParameter('address', item),
      ),
    ];

    const [resBep20From, resBep20To, resErc1155From, resErc1155To]: any =
      await Promise.all([
        this.customWeb3Client.ethGetLogs(coins, from, to, bep20FromTopics),
        this.customWeb3Client.ethGetLogs(coins, from, to, bep20ToTopics),
        this.customWeb3Client.ethGetLogs(coins, from, to, erc1155FromTopics),
        this.customWeb3Client.ethGetLogs(coins, from, to, erc1155ToTopics),
      ]);

    return [...resBep20From, ...resBep20To, ...resErc1155From, ...resErc1155To];
  }

  private filterLogs(logs: any[]) {
    const addressesWith1155Transfer = logs
      .filter((item) => TRANSFERS_1155.includes(item.topics[0]))
      .map((item) => item.address);

    // if transaction's transfers includes 20 and 1155 transfers with same address, then ignore 20 standard
    return logs
      .filter((item) => TRANSFER_TOPICS_ALL.includes(item.topics[0]))
      .filter(
        (item) =>
          !addressesWith1155Transfer.includes(item.address) ||
          (addressesWith1155Transfer.includes(item.address) &&
            TRANSFERS_1155.includes(item.topics[0])),
      );
  }

  private getFilledTransfer(log: any, transaction: GameTransaction) {
    const is20std = TRANSFERS_20.includes(log.topics[0]);

    const transfer = new TransferDto();

    const from = is20std ? log.topics[1] : log.topics[2];
    transfer.from = this.customWeb3Client.decodeParameter('address', from);
    transfer.from = transfer.from.toLowerCase();

    const to = is20std ? log.topics[2] : log.topics[3];
    transfer.to = this.customWeb3Client.decodeParameter('address', to);
    transfer.to = transfer.to.toLowerCase();

    transfer.method = transaction?.input;
    transfer.gameId = transaction?.gameId;
    transfer.transactionHash = log.transactionHash;
    transfer.tokenContract = log.address.toLowerCase();
    transfer.blockNumber = this.customWeb3Client.hexToNumber(log.blockNumber);

    transfer.transactionCreatedAt = transaction?.createdAt;
    transfer.transactionTo = transaction?.addressTo?.toLowerCase();
    transfer.transactionFrom = transaction?.addressFrom?.toLowerCase();

    return transfer;
  }

  private mapLogToTransferDto(
    log: any,
    transaction: GameTransaction = null,
  ): TransferDto[] {
    const result = [];

    switch (log.topics[0]) {
      case TRANSFER_TOPIC_BEP20: {
        const transfer = this.getFilledTransfer(log, transaction);
        transfer.standard = TokenStandard.BEP20;

        const tokenId = parseInt(log.topics[3], 16);
        transfer.tokenId = !isNaN(tokenId) ? tokenId.toString() : null;
        const amount = parseInt(log.data, 16);
        transfer.amount = !isNaN(amount) ? amount.toString() : '1';

        result.push(transfer);
        break;
      }
      case TRANSFER_TOPIC_SINGLE_ERC1155: {
        const transfer = this.getFilledTransfer(log, transaction);
        transfer.standard = TokenStandard.ERC1155;

        const data = ChainService.explodeTransferDataStringToArray(log.data);
        transfer.tokenId = parseInt(data[0], 16).toString();
        transfer.amount = parseInt(data[1], 16).toString();

        result.push(transfer);
        break;
      }
      case TRANSFER_TOPIC_MULTIPLE_ERC1155: {
        const data = ChainService.explodeTransferDataStringToArray(log.data);

        const countTokens = (data.length - 4) / 2;
        const systemInfoLength = 3;
        for (let i = 0; i < countTokens; i++) {
          const position = i + systemInfoLength;

          const transfer = this.getFilledTransfer(log, transaction);
          transfer.standard = TokenStandard.ERC1155;

          transfer.tokenId = parseInt(data[position], 16).toString();
          const amount = parseInt(data[position + countTokens + 1], 16);
          transfer.amount = amount.toString();

          result.push(transfer);
        }
        break;
      }
    }

    return result;
  }
}
