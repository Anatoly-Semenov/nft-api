import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { TokenContract } from '../entities/token-contract.entity';
import { GameContract } from '../entities/game-contract.entity';
import { GameWallet } from '../entities/game-wallet.entity';
import { ContractDto } from '../dto/contract.dto';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { TransferDto } from '../dto/transfer.dto';
import { filterArrayByAnotherArray } from '../../common/utils/array.utils';

@Injectable()
export class ContractService {
  private contractListFull;

  constructor(
    @InjectRepository(GameWallet)
    private gameWalletRepository: Repository<GameWallet>,
    @InjectRepository(GameContract)
    private gameContractRepository: Repository<GameContract>,
    @InjectRepository(TokenContract)
    private tokenContractRepository: Repository<TokenContract>,
  ) {}

  static getDefaultChainCoin(chain: string) {
    //TODO: move chain type and coin address to enum

    switch (chain) {
      case 'BSC':
        return '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
      default:
        return null;
    }
  }

  getGameContracts(gameId: number): Promise<GameContract[]> {
    return this.gameContractRepository.find({
      game_id: gameId,
    });
  }

  getGameWallets(gameId: number): Promise<GameWallet[]> {
    return this.gameWalletRepository.find({
      game_id: gameId,
      is_system: false,
    });
  }

  getSystemWallets(gameId: number): Promise<GameWallet[]> {
    return this.gameWalletRepository.find({
      game_id: gameId,
      is_system: true,
    });
  }

  getKnownNftList(gameId: number): Promise<TokenContract[]> {
    return this.tokenContractRepository.find({
      game_id: gameId,
      is_coin: false,
      title: Not('UNKNOWN'),
      chain_id: 'binance-smart-chain',
    });
  }

  getAllNftList(gameId: number): Promise<TokenContract[]> {
    return this.tokenContractRepository.find({
      game_id: gameId,
      is_coin: false,
      chain_id: 'binance-smart-chain',
    });
  }

  getCoins(gameId: number): Promise<TokenContract[]> {
    return this.tokenContractRepository.find({
      game_id: gameId,
      is_coin: true,
      title: Not('UNKNOWN'),
      chain_id: 'binance-smart-chain',
    });
  }

  async create(transfers: TransferDto[], config: ParserConfigDto) {
    let list = transfers.map((item) => item.tokenContract.toLowerCase());
    list = filterArrayByAnotherArray(list, [
      ...config.coinAddresses,
      ...config.nftAddresses,
    ]);

    const addresses = new Set(list);

    const entities = [...addresses].map((item) => {
      const entity = new TokenContract();
      entity.address = item;
      entity.game_id = config.gameId;
      entity.title = 'UNKNOWN';
      entity.is_coin = false;

      return entity;
    });

    const all = await this.tokenContractRepository.save(entities);

    all.forEach((item) => config.nfts.add(item));
    addresses.forEach((item) => config.nftAddresses.add(item));
  }

  async getTokenByAddress(address: string, config: ParserConfigDto) {
    const addressLow = address.toLowerCase();

    if (config.coinAddresses.has(addressLow)) {
      for (const e of config.coins) {
        if (e.address === addressLow) {
          return e;
        }
      }
    }

    if (config.nftAddresses.has(addressLow)) {
      for (const e of config.nfts) {
        if (e.address === addressLow) {
          return e;
        }
      }
    }
  }

  async getTokensByIds(ids: number[]) {
    if (!ids) return [];

    return this.tokenContractRepository.find({
      id: In(ids),
      title: Not('UNKNOWN'),
    });
  }

  async isContractAddress(address: string): Promise<boolean> {
    if (this.contractListFull) {
      return this.contractListFull.indexOf(address.toLowerCase()) >= 0;
    }

    return await Promise.all([
      this.gameContractRepository.find(),
      this.tokenContractRepository.find(),
    ]).then(([gameContracts, tokenContracts]) => {
      const game = gameContracts.map((item) => item.address);
      const token = tokenContracts.map((item) => item.address);
      this.contractListFull = [...game, ...token];

      return this.contractListFull.indexOf(address.toLowerCase()) >= 0;
    });
  }

  async getGamesIdList() {
    const result = await this.gameContractRepository
      .createQueryBuilder()
      .select('DISTINCT game_id AS game_id')
      .where('game_id IS NOT NULL')
      .orderBy({ game_id: 'ASC' })
      .getRawMany();

    return result.map((item) => item.game_id);
  }

  contractsToLower() {
    // language=PostgreSQL
    const queryToken = `
      UPDATE
        token_contract
      SET
        address = lower(address)
      WHERE
        chain_id != 'solana'
    `;
    // language=PostgreSQL
    const queryGame = `UPDATE game_contract
                       SET address = lower(address)`;
    // language=PostgreSQL
    const queryWallet = `UPDATE game_contract
                         SET address = lower(address)`;

    return Promise.all([
      this.tokenContractRepository.query(queryToken),
      this.gameContractRepository.query(queryGame),
      this.gameWalletRepository.query(queryWallet),
    ]);
  }

  getDoubledTokens() {
    return this.tokenContractRepository
      .createQueryBuilder()
      .select('MIN(id) AS id, address')
      .groupBy('address')
      .having('count(*) > 1')
      .getRawMany();
  }

  getSameTokens(id: number, address: string) {
    return this.tokenContractRepository.find({
      address: address,
      id: Not(id),
    });
  }

  deleteToken(tokens: TokenContract[]) {
    return this.tokenContractRepository.remove(tokens);
  }

  async getContractWithInternalTransactions() {
    return await this.gameContractRepository.find({
      where: {
        force_grab_internal: true,
      },
    });
  }

  async getGameContractList(): Promise<ContractDto[]> {
    const list = await this.gameContractRepository.find({
      order: {
        game_id: 'ASC',
      },
    });

    return list.map(
      (item) =>
        new ContractDto({
          id: item.id,
          gameId: item.game_id,
          address: item.address,
          title: item.title,
        }),
    );
  }

  saveGameContract(dto: ContractDto) {
    const entity = new GameContract();
    if (dto.id) entity.id = dto.id;
    entity.game_id = dto.gameId;
    entity.title = dto.title;
    entity.address = dto.address.toLowerCase();
    entity.force_grab_internal = false;

    return this.gameContractRepository.save(entity);
  }

  deleteGameContract(id: number) {
    return this.gameContractRepository.delete({ id });
  }

  async getTokenContractList(): Promise<ContractDto[]> {
    const list = await this.tokenContractRepository.find({
      order: {
        game_id: 'ASC',
      },
    });

    return list.map(
      (item) =>
        new ContractDto({
          id: item.id,
          gameId: item.game_id,
          address: item.address,
          title: item.title,
          isCoin: item.is_coin,
        }),
    );
  }

  saveTokenContract(dto: ContractDto) {
    const entity = new TokenContract();
    if (dto.id) entity.id = dto.id;
    entity.game_id = dto.gameId;
    entity.title = dto.title;
    entity.address = dto.address.toLowerCase();
    entity.is_coin = dto.isCoin;

    return this.tokenContractRepository.save(entity);
  }

  deleteTokenContract(id: number) {
    return this.tokenContractRepository.delete({ id });
  }

  async getGameWalletList(): Promise<ContractDto[]> {
    const list = await this.gameWalletRepository.find({
      order: {
        game_id: 'ASC',
      },
    });

    return list.map(
      (item) =>
        new ContractDto({
          id: item.id,
          gameId: item.game_id,
          address: item.address,
          title: item.title,
        }),
    );
  }

  saveGameWallet(dto: ContractDto) {
    const entity = new GameWallet();
    if (dto.id) entity.id = dto.id;
    entity.game_id = dto.gameId;
    entity.title = dto.title;
    entity.address = dto.address.toLowerCase();
    entity.force_grab_internal = false;

    return this.gameWalletRepository.save(entity);
  }

  deleteGameWallet(id: number) {
    return this.gameWalletRepository.delete({ id });
  }
}
