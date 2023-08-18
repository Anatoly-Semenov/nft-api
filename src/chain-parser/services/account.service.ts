import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Account } from '../entities/account.entity';
import { TransferDto } from '../dto/transfer.dto';
import { ContractService } from './contract.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { ParserConfigDto } from '../dto/parser-config.dto';
import * as moment from 'moment';
import { ChartsQueryDto } from '../dto/charts-query.dto';

@Injectable()
export class AccountService {
  private accountCache: { [key: string]: Account } = {};

  constructor(
    private contractService: ContractService,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private static isPlayerAccount(walletAddress: string, transfer: TransferDto) {
    if (!transfer.transactionFrom) return false;

    return (
      walletAddress.toLowerCase() === transfer.transactionFrom.toLowerCase()
    );
  }

  getAccount(walletAddress: string): Account {
    return this.accountCache[walletAddress];
  }

  /**
   * Create or update accounts for all founded transfers
   *
   * @param transfers
   * @param config
   */
  async create(transfers: TransferDto[], config: ParserConfigDto) {
    const accountsByAddress = await this.getAccountsByAddresses(transfers);

    const gameId = transfers[0].gameId;

    const existingAccounts = await this.findExistingAccounts(
      Object.keys(accountsByAddress),
      gameId,
    );
    const existingAddresses = existingAccounts.map((item) => item.address);

    const accountsForUpdate = existingAccounts.filter((item) => {
      const relatedDto = accountsByAddress[item.address];

      return (
        item.first_block > relatedDto.firstTime ||
        item.is_player != relatedDto.isPlayer
      );
    });

    accountsForUpdate.forEach((item) => {
      const relatedDto = accountsByAddress[item.address];
      this.updateAccount(item, relatedDto);
    });

    const newAccountsDto = Object.values(accountsByAddress).filter(
      (item: CreateAccountDto) => existingAddresses.indexOf(item.address) < 0,
    );

    await Promise.all(
      newAccountsDto.map((item: CreateAccountDto) =>
        this.createAccount(item, config),
      ),
    );

    await this.renewAccountCache(Object.keys(accountsByAddress), gameId);
  }

  async setFirstTime(gameId: number) {
    // language=PostgreSQL
    const query = `
        UPDATE account acc
        SET first_time = (SELECT min(r.date) AS date
                          FROM (SELECT a.id, min(atr.created_at) AS date
                                FROM account a
                                         JOIN account_transfer atr
                                              ON atr.created_at IS NOT NULL AND
                                                 (a.id = atr.from_account_id OR a.id = atr.to_account_id)
                                WHERE a.id = acc.id
                                GROUP BY a.id) r
                          GROUP BY r.id)
        WHERE acc.game_id = $1;
    `;

    return this.connection.query(query, [gameId]);
  }

  async getNftBurnAndMintByGame(
    gameId: number,
    chartsQueryDto: ChartsQueryDto,
  ) {
    const { isSolana } = chartsQueryDto;

    const currentDate = moment();
    let startedAt = moment().set('month', currentDate.get('month') - 2);
    startedAt = startedAt.startOf('month');

    const queries = ['day', 'week', 'month'].map((period) =>
      isSolana
        ? this.getSolanaNftBurnAndMint(
            gameId,
            period,
            startedAt.format('YYYY-MM-DD'),
          )
        : this.getBscNftBurnAndMint(
            gameId,
            period,
            startedAt.format('YYYY-MM-DD'),
          ),
    );

    const [daily, weekly, monthly] = await Promise.all(queries);

    if (!daily.length) {
      return { daily: [], weekly: [], monthly: [] };
    }

    return { daily, weekly, monthly };
  }

  private createAccount(accountDto: CreateAccountDto, config: ParserConfigDto) {
    const account = new Account();
    account.game_id = accountDto.gameId;
    account.address = accountDto.address;
    account.first_block = accountDto.firstBlock;
    account.is_contract = accountDto.isContract;
    account.is_player = accountDto.isPlayer;
    account.is_system = config.systemAddressList.includes(accountDto.address);

    return this.accountRepository.save(account);
  }

  private updateAccount(account: Account, dto: CreateAccountDto) {
    if (account.first_block > dto.firstBlock || !account.first_block) {
      account.first_block = dto.firstBlock;
    }

    // update isPlayer only from false to true
    if (dto.isPlayer) {
      account.is_player = dto.isPlayer;
    }

    return this.accountRepository.save(account);
  }

  private async getFilledDto(address: string, transfer: TransferDto, previous) {
    const createAccountDto = new CreateAccountDto();
    createAccountDto.address = address;
    createAccountDto.gameId = transfer.gameId;
    createAccountDto.firstBlock = transfer.blockNumber;
    createAccountDto.isContract = await this.contractService.isContractAddress(
      address,
    );
    createAccountDto.isPlayer = AccountService.isPlayerAccount(
      address,
      transfer,
    );

    if (!previous[address]) {
      previous[address] = createAccountDto;
    }

    const existingDto = previous[address];

    if (createAccountDto.isPlayer && !existingDto.isPlayer) {
      existingDto.isPlayer = createAccountDto.isPlayer;
    }

    if (existingDto.firstTime > createAccountDto.firstBlock) {
      existingDto.firstTime = createAccountDto.firstBlock;
    }
  }

  private async getAccountsByAddresses(transfers) {
    const result = {};

    for (const transfer of transfers) {
      let addresses = [
        transfer.from,
        transfer.to,
        transfer.transactionFrom,
        transfer.transactionTo,
      ];

      addresses = addresses.filter((item) => !!item);

      for (const addressStr of addresses) {
        const address = addressStr.toLowerCase();

        await this.getFilledDto(address, transfer, result);
      }
    }

    return result;
  }

  private async findExistingAccounts(
    addresses: string[],
    gameId: number,
  ): Promise<Account[]> {
    if (!addresses.length) {
      return [];
    }

    return this.accountRepository
      .createQueryBuilder('a')
      .where('a.game_id = :gameId')
      .andWhere('a.address IN (:...addresses)')
      .setParameters({ gameId, addresses })
      .getMany();
  }

  private async renewAccountCache(accountsByAddress: string[], gameId: number) {
    const result = {};

    const accounts = await this.findExistingAccounts(accountsByAddress, gameId);

    for (const account of accounts) {
      result[account.address] = account;
    }

    this.accountCache = result;
  }

  private getBscNftBurnAndMint = (
    gameId: number,
    period: string,
    dateFrom: string,
  ) =>
    this.connection.query(`
      SELECT
        DATE_TRUNC('${period}', at.created_at) AS date,
        COUNT(
          CASE WHEN acc.id = at.from_account_id THEN
            1
          END)::int AS mint,
        COUNT(
          CASE WHEN acc.id = at.to_account_id THEN
            1
          END)::int AS burn
      FROM
        account acc
        LEFT JOIN account_transfer at ON at.game_id = acc.game_id
      WHERE
        acc.game_id = ${gameId}
        AND at.token_id IS NOT NULL
        AND acc.address IN('0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000001', '0x000000000000000000000000000000000000dead')
        AND at.created_at > '${dateFrom}'
      GROUP BY
        date
      ORDER BY
        date ASC
  `);

  private getSolanaNftBurnAndMint = (
    gameId: number,
    period: string,
    dateFrom: string,
  ) =>
    this.connection.query(`
      SELECT
        DATE_TRUNC('${period}', sata.created_at) AS date,
        COUNT(sata.main_address)::int AS mint,
        0 AS burn
      FROM
        solana_account sa
        JOIN solana_account_transfer_aggregation sata ON sa.address = sata.main_address
      WHERE
        sa.is_contract = TRUE
        AND sa.is_mint = TRUE
        AND sata.game_id = ${gameId}
        AND sata.created_at > '${dateFrom}'
      GROUP BY
        date
      ORDER BY
        date
  `);
}
