import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getMint,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  ConfirmedSignatureInfo,
  Connection,
  ParsedInstruction,
  ParsedTransactionWithMeta,
  PublicKey,
  SignaturesForAddressOptions,
  SystemProgram,
} from '@solana/web3.js';
import { SolanaAssociatedTokenAccountType } from '../enums/solana-associated-token-account-type.enum';
import { SolanaAccount } from '../entities/solana-account.entity';
import { SolanaAssociatedTokenAccount } from '../entities/solana-associated-token-account.entity';
import {
  SOLANA_ACCOUNT_REPOSITORY_SERVICE_NAME,
  SolanaAccountRepository,
} from '../repositories/solana-account.repository';
import {
  SOLANA_ASSOCIATED_TOKEN_ACCOUNT_REPOSITORY_SERVICE_NAME,
  SolanaAssociatedTokenAccountRepository,
} from '../repositories/solana-associated-token-account.repository';
import {
  SOLANA_ACCOUNT_TRANSACTION_REPOSITORY_SERVICE_NAME,
  SolanaAccountTransactionRepository,
} from '../repositories/solana-account-transaction.repository';
import {
  SOLANA_NFT_TRANSFER_REPOSITORY_SERVICE_NAME,
  SolanaNftTransferRepository,
} from '../repositories/solana-nft-transfer.repository';
import {
  SOLANA_SIGNATURE_REPOSITORY_SERVICE_NAME,
  SolanaSignatureRepository,
} from '../repositories/solana-signature.repository';
import {
  SOLANA_TOKEN_CONTRACT_REPOSITORY_SERVICE_NAME,
  SolanaTokenContractRepository,
} from '../repositories/solana-token-contract.repository';
import { SolanaSignature } from '../entities/solana-signature.entity';
import { SolanaSignatureStateEnum } from '../enums/solana-signature-state.enum';
import { SolanaAccountTransaction } from '../entities/solana-account-transaction.entity';
import { SolanaAccountTransactionTransferType } from '../enums/solana-account-transaction-transfer-type.enum';
import { SolanaNftTransfer } from '../entities/solana-nft-transfer.entity';
import { TokenAccount } from '../types/TokenAccount';
import { NFTMovementSettings } from '../types/NFTMovementSettings';
import { GameTokenAddressList } from '../types/GameTokenAddressList';
import { GameTokenAddressObjectList } from '../types/GameTokenAddressObjectList';
import { SolanaNftTypeMovement } from '../enums/solana-nft-type-movement.enum';
import { SolanaTokenContract } from '../entities/solana-token-contract.entity';
import { DecodedAccountInfo } from '../types/DecodedAccountInfo';

const SOL_TOKEN_CONTRACT = '0xSOL';

const SOLANA_RPC_ENDPOINT =
  'https://black-morning-water.solana-mainnet.quiknode.pro/5b2d0f07a292488545649b2003c0a593a724c36f/';

@Injectable()
export class SolanaGameParserService {
  private readonly logger = new Logger(SolanaGameParserService.name);

  constructor(
    @Inject(SOLANA_ACCOUNT_REPOSITORY_SERVICE_NAME)
    private readonly accountRepository: SolanaAccountRepository,
    @Inject(SOLANA_ACCOUNT_TRANSACTION_REPOSITORY_SERVICE_NAME)
    private readonly accountTransactionRepository: SolanaAccountTransactionRepository,
    @Inject(SOLANA_ASSOCIATED_TOKEN_ACCOUNT_REPOSITORY_SERVICE_NAME)
    private readonly associatedTokenAccountRepository: SolanaAssociatedTokenAccountRepository,
    @Inject(SOLANA_NFT_TRANSFER_REPOSITORY_SERVICE_NAME)
    private readonly nftTransferRepository: SolanaNftTransferRepository,
    @Inject(SOLANA_SIGNATURE_REPOSITORY_SERVICE_NAME)
    private readonly signatureRepository: SolanaSignatureRepository,
    @Inject(SOLANA_TOKEN_CONTRACT_REPOSITORY_SERVICE_NAME)
    private readonly tokenContractRepository: SolanaTokenContractRepository,
  ) {}

  async saveNewAssociatedAccountList(ownerPublicKey: string): Promise<void> {
    const debugStartDate = new Date();
    const apiClient = SolanaGameParserService.getApiClient();

    const ownerAccountEntity = await this.accountRepository.findByAddress(
      ownerPublicKey,
    );

    if (!ownerAccountEntity) {
      this.logger.warn(
        `Function "saveNewAssociatedAccountList" was stopped. Args: "ownerPublicKey" = ${ownerPublicKey}. Start date: ${debugStartDate}. Reason: ownerAccountEntity not found!`,
      );
      return;
    }

    this.logger.log(
      `Start request token account for "${ownerAccountEntity.address}". Game: ${ownerAccountEntity.game_id}`,
    );

    const tokenAccounts = await apiClient.getTokenAccountsByOwner(
      new PublicKey(ownerAccountEntity.address),
      {
        programId: TOKEN_PROGRAM_ID,
      },
    );

    const totalTokenAccounts = tokenAccounts.value.length;

    this.logger.log(
      `END request token account for "${ownerAccountEntity.address}". Game: ${ownerAccountEntity.game_id}. Total ${totalTokenAccounts}`,
    );

    let tokenAccountList = [];
    for (let i = 0; i < totalTokenAccounts; i++) {
      const currentTokenAccount = tokenAccounts.value[i];

      tokenAccountList.push(currentTokenAccount);

      if (i % 1000 === 0 || i === totalTokenAccounts - 1) {
        this.logger.log(
          `Iteration ${i} for save token account of "${ownerAccountEntity.address}". Game: ${ownerAccountEntity.game_id}. Total ${totalTokenAccounts}`,
        );
        await this.saveNewAssociatedAccounts(
          tokenAccountList,
          ownerAccountEntity,
        );

        tokenAccountList = [];
      }
    }
  }

  async markAssociatedAccountAsCoinOrNft(
    ownerPublicKey: string,
  ): Promise<void> {
    const debugStartDate = new Date();
    const ownerAccountEntity = await this.accountRepository.findByAddress(
      ownerPublicKey,
    );

    if (!ownerAccountEntity) {
      this.logger.warn(
        `Function "markAssociatedAccountAsCoinOrNft" was stopped. Args: "ownerPublicKey" = ${ownerPublicKey}. Start date: ${debugStartDate}. Reason: ownerAccountEntity not found!`,
      );
      return;
    }

    const apiClient = SolanaGameParserService.getApiClient();

    let unmarkedAssociatedAccounts = await this.getUnmarkedAssociatedAccounts(
      ownerAccountEntity.id,
    );

    while (unmarkedAssociatedAccounts.length) {
      this.logger.log(
        `Start new iteration for mark accounts of "${ownerAccountEntity.address}". Game: ${ownerAccountEntity.game_id}.`,
      );

      const requests = [];

      for (let idx = 0; idx < unmarkedAssociatedAccounts.length; idx++) {
        const account = unmarkedAssociatedAccounts[idx];
        requests.push(getMint(apiClient, new PublicKey(account.mint)));
      }

      const mintList = await Promise.all(requests);

      for (let j = 0; j < mintList.length; j++) {
        const mint = mintList[j];
        const account = unmarkedAssociatedAccounts[j];
        account.type =
          mint.supply > 1
            ? SolanaAssociatedTokenAccountType.COIN
            : SolanaAssociatedTokenAccountType.NFT;

        await this.associatedTokenAccountRepository.save(account);
      }

      unmarkedAssociatedAccounts = await this.getUnmarkedAssociatedAccounts(
        ownerAccountEntity.id,
      );
    }
  }

  async saveNewSignatureListForAssociatedAccount(
    associatedTokenAccountPublicKey: string,
  ): Promise<void> {
    const debugStartDate = new Date();

    const associatedTokenAccountList =
      await this.associatedTokenAccountRepository.findByAssociatedTokenAccountPublicKey(
        associatedTokenAccountPublicKey,
      );

    if (associatedTokenAccountList.length !== 1) {
      this.logger.warn(
        `Function "saveNewSignatureListForAssociatedAccount" was stopped. Args: "associatedTokenAccountPublicKey" = ${associatedTokenAccountPublicKey}. Start date: ${debugStartDate}. Reason: associatedTokenAccountList.length = ${associatedTokenAccountList.length}!`,
      );
      return;
    }

    const associatedTokenAccountEntity = associatedTokenAccountList[0];
    const totalSignatures =
      await this.signatureRepository.countByAssociatedTokenAccount(
        associatedTokenAccountEntity.id,
      );

    if (!totalSignatures) {
      await this.saveSignatureListFromCurrentPointInTimeToFirstTransaction(
        associatedTokenAccountEntity,
      );

      return;
    }

    const isExistLastSignature =
      await this.signatureRepository.getSomeSignatureWithStateLastByAssociatedTokenAccountId(
        associatedTokenAccountEntity.id,
      );

    if (!isExistLastSignature) {
      await this.saveSignatureListFromCurrentTransactionToFirstTransaction(
        associatedTokenAccountEntity,
      );
      return;
    }

    const firstSignature =
      await this.signatureRepository.getSomeSignatureWithStateFirstByAssociatedTokenAccountId(
        associatedTokenAccountEntity.id,
      );

    const lastSignatureUntilCurrentSignature =
      await this.signatureRepository.getLastSignatureUntilCurrentSignature(
        firstSignature,
      );

    if (!lastSignatureUntilCurrentSignature) {
      await this.saveNewSignature(
        associatedTokenAccountEntity.associated_token_account,
        { until: firstSignature.signature },
        associatedTokenAccountEntity.id,
        null,
      );
    } else {
      await this.saveNewSignature(
        associatedTokenAccountEntity.associated_token_account,
        {
          until: firstSignature.signature,
          before: lastSignatureUntilCurrentSignature.signature,
        },
        associatedTokenAccountEntity.id,
        null,
      );
    }

    const newFirstSignature =
      await this.signatureRepository.getFirstSignatureByAssociatedTokenAccountId(
        associatedTokenAccountEntity.id,
      );

    await this.signatureRepository.setNewFirstSignature(
      firstSignature,
      newFirstSignature,
    );
  }

  async saveNewSignatureListForAccount(
    accountPublicKey: string,
  ): Promise<void> {
    const debugStartDate = new Date();
    const accountEntity = await this.accountRepository.findByAddress(
      accountPublicKey,
    );

    if (!accountEntity) {
      this.logger.warn(
        `Function "saveNewSignatureListForAccount" was stopped. Args: "accountPublicKey" = ${accountPublicKey}. Start date: ${debugStartDate}. Reason: accountEntity not found!`,
      );
      return;
    }

    const totalSignatures = await this.signatureRepository.countByAccount(
      accountEntity.id,
    );

    if (!totalSignatures) {
      await this.saveSignatureListFromCurrentPointInTimeToFirstTransactionByAccount(
        accountEntity,
      );
      return;
    }

    const isExistLastSignature =
      await this.signatureRepository.getSomeSignatureWithStateLastByAccountId(
        accountEntity.id,
      );

    if (!isExistLastSignature) {
      await this.saveSignatureListFromCurrentTransactionToFirstTransactionByAccount(
        accountEntity,
      );
      return;
    }

    const firstSignature =
      await this.signatureRepository.getSomeSignatureWithStateFirstByAccountId(
        accountEntity.id,
      );

    const lastSignatureUntilCurrentSignature =
      await this.signatureRepository.getLastSignatureUntilCurrentSignature(
        firstSignature,
      );

    if (!lastSignatureUntilCurrentSignature) {
      await this.saveNewSignature(
        accountEntity.address,
        { until: firstSignature.signature },
        null,
        accountEntity.id,
      );
    } else {
      await this.saveNewSignature(
        accountEntity.address,
        {
          until: firstSignature.signature,
          before: lastSignatureUntilCurrentSignature.signature,
        },
        null,
        accountEntity.id,
      );
    }

    const newFirstSignature =
      await this.signatureRepository.getFirstSignatureByAccountId(
        accountEntity.id,
      );

    await this.signatureRepository.setNewFirstSignature(
      firstSignature,
      newFirstSignature,
    );
  }

  async saveNewCoinTransferList(
    tokenContractAddress: string,
    associatedTokenAddress: string,
    gameAddressList: string[],
  ): Promise<void> {
    const debugStartDate = new Date();

    const apiClient = SolanaGameParserService.getApiClient();
    const take = 500;
    const tokenContractEntity =
      await this.tokenContractRepository.findByAddress(tokenContractAddress);

    if (!tokenContractEntity) {
      this.logger.warn(
        `Function "saveNewCoinTransferList" was stopped. Args: "tokenContractAddress" = ${tokenContractAddress}; "associatedTokenAddress" = ${associatedTokenAddress}. Start date: ${debugStartDate}. Reason: tokenContractEntity not found!`,
      );
      return;
    }

    const associatedTokenAddressList =
      await this.associatedTokenAccountRepository.findByAssociatedTokenAccountPublicKey(
        associatedTokenAddress,
      );

    if (associatedTokenAddressList.length !== 1) {
      this.logger.warn(
        `Function "saveNewCoinTransferList" was stopped. Args: "tokenContractAddress" = ${tokenContractAddress}; "associatedTokenAddress" = ${associatedTokenAddress}. Start date: ${debugStartDate}. Reason: associatedTokenAddressList.length = ${associatedTokenAddressList.length}!`,
      );
      return;
    }

    const tokenMintAccount = associatedTokenAddressList[0].mint;
    const associatedTokenAddressId = associatedTokenAddressList[0].id;

    const firstSignature =
      await this.signatureRepository.getSomeSignatureWithStateFirstByAssociatedTokenAccountId(
        associatedTokenAddressId,
      );

    const lastSignature =
      await this.signatureRepository.getSomeSignatureWithStateLastByAssociatedTokenAccountId(
        associatedTokenAddressId,
      );

    if (!firstSignature || !lastSignature) {
      this.logger.warn(
        `Function "saveNewCoinTransferList" was stopped. Args: "tokenContractAddress" = ${tokenContractAddress}; "associatedTokenAddress" = ${associatedTokenAddress}. Start date: ${debugStartDate}. Reason: signature with state "first" or "last" not found!`,
      );
      return;
    }

    let signatureList =
      await this.signatureRepository.findNewSignatureListInRange(
        associatedTokenAddressId,
        firstSignature.block_time,
        lastSignature.block_time,
        take,
      );

    while (signatureList.length !== 0) {
      this.logger.log(
        `Start new coin transfer iteration for "${tokenContractEntity.title}". Game: ${tokenContractEntity.game_id}`,
      );

      signatureList =
        await this.signatureRepository.changeStateFromNewToInProgress(
          signatureList,
        );

      const transactionList =
        await SolanaGameParserService.getParsedTransactionList(
          signatureList,
          apiClient,
        );

      const accountTransactionValues = [];
      const preparedCoinTransferListRequest = [];
      for (let k = 0; k < transactionList.length; k++) {
        const tx = transactionList[k];

        if (tx === null) {
          continue;
        }

        preparedCoinTransferListRequest.push(
          this.prepareCoinTransferListForSaving(
            tx,
            tokenMintAccount,
            tokenContractEntity.id,
            //TODO: может быть передавать game_id в аргумненты исходной функции?
            // ведь мы вызываем этот "абстрактный сервис" внутри
            // конкретных сервисов игр для парсинга
            tokenContractEntity.game_id,
            gameAddressList,
          ),
        );
      }

      const preparedCoinTransferListResponse = await Promise.all(
        preparedCoinTransferListRequest,
      );

      for (let i = 0; i < preparedCoinTransferListResponse.length; i++) {
        const preparedCoinTransfer = preparedCoinTransferListResponse[i];
        for (let j = 0; j < preparedCoinTransfer.length; j++) {
          accountTransactionValues.push(preparedCoinTransfer[j]);
        }
      }

      await this.accountTransactionRepository.multipleInsert(
        accountTransactionValues,
      );

      //TODO: может быть сделать удаление этих записей? КРОМЕ FIRST И LAST
      await this.signatureRepository.changeStateFromInProgressToProcessed(
        signatureList,
      );

      signatureList =
        await this.signatureRepository.findNewSignatureListInRange(
          associatedTokenAddressId,
          firstSignature.block_time,
          lastSignature.block_time,
          take,
        );
    }
  }

  async saveNewSolTransferList(
    accountAddress: string,
    gameAddressList: string[],
  ): Promise<void> {
    const debugStartDate = new Date();

    const apiClient = SolanaGameParserService.getApiClient();
    const take = 500;
    const tokenContractEntity =
      await this.tokenContractRepository.findByAddress(SOL_TOKEN_CONTRACT);

    if (!tokenContractEntity) {
      this.logger.warn(
        `Function "saveNewSolTransferList" was stopped. Args: "accountAddress" = ${accountAddress}. Start date: ${debugStartDate}. Reason: tokenContractEntity not found!`,
      );
      return;
    }

    const accountEntity = await this.accountRepository.findByAddress(
      accountAddress,
    );

    if (!accountEntity) {
      this.logger.warn(
        `Function "saveNewSolTransferList" was stopped. Args: "accountAddress" = ${accountAddress}. Start date: ${debugStartDate}. Reason: accountEntity not found!`,
      );
      return;
    }

    const accountId = accountEntity.id;
    const gameId = accountEntity.game_id;
    const tokenContractId = tokenContractEntity.id;

    const firstSignature =
      await this.signatureRepository.getSomeSignatureWithStateFirstByAccountId(
        accountEntity.id,
      );

    const lastSignature =
      await this.signatureRepository.getSomeSignatureWithStateLastByAccountId(
        accountEntity.id,
      );

    if (!firstSignature || !lastSignature) {
      this.logger.warn(
        `Function "saveNewSolTransferList" was stopped. Args: "accountAddress" = ${accountAddress}. Start date: ${debugStartDate}. Reason: signature with state "first" or "last" not found!`,
      );
      return;
    }

    let signatureList =
      await this.signatureRepository.findNewSignatureListInRangeForAccountId(
        accountId,
        firstSignature.block_time,
        lastSignature.block_time,
        take,
      );

    while (signatureList.length !== 0) {
      this.logger.log(
        `Start new coin transfer iteration for "${tokenContractEntity.title}". Game: ${tokenContractEntity.game_id}`,
      );

      signatureList =
        await this.signatureRepository.changeStateFromNewToInProgress(
          signatureList,
        );

      const transactionList =
        await SolanaGameParserService.getParsedTransactionList(
          signatureList,
          apiClient,
        );

      const accountTransactionValues = [];
      for (let k = 0; k < transactionList.length; k++) {
        const tx = transactionList[k];

        if (tx === null) {
          continue;
        }

        const instructionList = SolanaGameParserService.prepareInstructionList(
          tx,
          [SystemProgram.programId.toBase58()],
        );

        for (let j = 0; j < instructionList.length; j++) {
          const info = instructionList[j].parsed?.info;

          const type = instructionList[j].parsed?.type;
          if (type !== 'transfer') {
            this.logger.error('---- Not Transfer ----');
            this.logger.error('tx.transaction.signatures: ');
            this.logger.error(tx.transaction.signatures);
            this.logger.error('instruction info: ');
            this.logger.error(info);
            this.logger.error('instruction type: ');
            this.logger.error(type);
            this.logger.error('---- Not Transfer ----');
            throw Error('Not Transfer');
          }

          const lamports = parseInt(info.lamports, 10);

          const ownerSource = info.source;
          const ownerDestination = info.destination;

          if (!ownerSource || !ownerDestination) {
            continue;
          }

          const transfer = await this.prepareTransfer(
            ownerSource,
            ownerDestination,
            gameId,
            lamports,
            tx,
            tokenContractId,
            gameAddressList,
          );
          accountTransactionValues.push(transfer);
        }
      }

      await this.accountTransactionRepository.multipleInsert(
        accountTransactionValues,
      );

      //TODO: может быть сделать удаление этих записей? КРОМЕ FIRST И LAST
      await this.signatureRepository.changeStateFromInProgressToProcessed(
        signatureList,
      );

      signatureList =
        await this.signatureRepository.findNewSignatureListInRangeForAccountId(
          accountId,
          firstSignature.block_time,
          lastSignature.block_time,
          take,
        );
    }
  }

  async saveNewNftMovement(
    accountAddress: string,
    gameAddressList: string[],
    marketplaceList: string[],
    tokenAddressListForPayment = [],
  ): Promise<void> {
    const debugStartDate = new Date();
    const settings: NFTMovementSettings = {
      marketplaceList: marketplaceList,
    };

    const solTokenContractEntity =
      await this.tokenContractRepository.findByAddress(SOL_TOKEN_CONTRACT);

    if (!solTokenContractEntity) {
      this.logger.warn(
        `Function "saveNewNftMovement" was stopped. Start date: ${debugStartDate}. Reason: solTokenContractEntity not found!`,
      );
      return;
    }

    const accountEntity = await this.accountRepository.findByAddress(
      accountAddress,
    );
    if (!accountEntity) {
      this.logger.warn(
        `Function "saveNewNftMovement" was stopped. Args: "accountAddress" = ${accountAddress}. Start date: ${debugStartDate}. Reason: accountEntity not found!`,
      );
      return;
    }

    if (tokenAddressListForPayment.length) {
      const tokenContractListForPayment =
        await this.tokenContractRepository.findByAddressList(
          tokenAddressListForPayment,
        );

      if (
        tokenAddressListForPayment.length !== tokenContractListForPayment.length
      ) {
        this.logger.warn(
          `Function "saveNewNftMovement" was stopped. Args: "accountAddress" = ${accountAddress}. Start date: ${debugStartDate}. Reason: tokenAddressListForPayment.length !== tokenContractListForPayment.length!`,
        );
        return;
      }

      settings.tokenAddress2TokenIdForPayment =
        tokenContractListForPayment.reduce((acc, curr) => {
          acc[curr.address] = curr.id;
          return acc;
        }, {});
    }

    let iteration = 0;
    let nftAccountList = await this.associatedTokenAccountRepository.bath250Nft(
      accountEntity.id,
      iteration,
    );

    while (nftAccountList.length !== 0) {
      this.logger.log(
        `Start new iteration "${iteration}" for parse nft movement of "${accountEntity.address}". Game: ${accountEntity.game_id}.`,
      );

      const nftTransferListRequest = [];
      for (let idx = 0; idx < nftAccountList.length; idx++) {
        const nftAccount = nftAccountList[idx];
        nftTransferListRequest.push(
          this.prepareNftTransferList(
            nftAccount,
            accountEntity,
            gameAddressList,
            settings,
            solTokenContractEntity,
          ),
        );
      }

      const nftTransferList = await Promise.all(nftTransferListRequest);
      const nftTransferListValue = nftTransferList.flat();

      await this.nftTransferRepository.multipleInsert(nftTransferListValue);

      iteration++;
      nftAccountList = await this.associatedTokenAccountRepository.bath250Nft(
        accountEntity.id,
        iteration,
      );
    }
  }

  private async saveSignatureListFromCurrentTransactionToFirstTransactionByAccount(
    accountEntity: SolanaAccount,
  ): Promise<void> {
    let lastSignatureEntity =
      await this.signatureRepository.getLastSignatureByAccountId(
        accountEntity.id,
      );

    await this.saveNewSignature(
      accountEntity.address,
      { before: lastSignatureEntity.signature },
      null,
      accountEntity.id,
    );

    lastSignatureEntity =
      await this.signatureRepository.getLastSignatureByAccountId(
        accountEntity.id,
      );

    lastSignatureEntity.state = SolanaSignatureStateEnum.NEW_LAST_SIGNATURE;
    await this.signatureRepository.save(lastSignatureEntity);
  }

  private async saveSignatureListFromCurrentTransactionToFirstTransaction(
    associatedTokenAccountEntity: SolanaAssociatedTokenAccount,
  ): Promise<void> {
    let lastSignatureEntity =
      await this.signatureRepository.getLastSignatureByAssociatedTokenAccountId(
        associatedTokenAccountEntity.id,
      );

    await this.saveNewSignature(
      associatedTokenAccountEntity.associated_token_account,
      { before: lastSignatureEntity.signature },
      associatedTokenAccountEntity.id,
      null,
    );

    lastSignatureEntity =
      await this.signatureRepository.getLastSignatureByAssociatedTokenAccountId(
        associatedTokenAccountEntity.id,
      );

    lastSignatureEntity.state = SolanaSignatureStateEnum.NEW_LAST_SIGNATURE;
    await this.signatureRepository.save(lastSignatureEntity);
  }

  private async saveSignatureListFromCurrentPointInTimeToFirstTransactionByAccount(
    accountEntity: SolanaAccount,
  ): Promise<void> {
    await this.saveNewSignature(
      accountEntity.address,
      {},
      null,
      accountEntity.id,
    );

    const lastSignatureEntity =
      await this.signatureRepository.getLastSignatureByAccountId(
        accountEntity.id,
      );

    lastSignatureEntity.state = SolanaSignatureStateEnum.NEW_LAST_SIGNATURE;
    await this.signatureRepository.save(lastSignatureEntity);
  }

  private async saveSignatureListFromCurrentPointInTimeToFirstTransaction(
    associatedTokenAccountEntity: SolanaAssociatedTokenAccount,
  ): Promise<void> {
    await this.saveNewSignature(
      associatedTokenAccountEntity.associated_token_account,
      {},
      associatedTokenAccountEntity.id,
      null,
    );

    const lastSignatureEntity =
      await this.signatureRepository.getLastSignatureByAssociatedTokenAccountId(
        associatedTokenAccountEntity.id,
      );

    lastSignatureEntity.state = SolanaSignatureStateEnum.NEW_LAST_SIGNATURE;
    await this.signatureRepository.save(lastSignatureEntity);
  }

  private async prepareNftTransferList(
    nftAccount: SolanaAssociatedTokenAccount,
    accountWhoInitializeMint: SolanaAccount,
    gameAddressList: string[],
    settings: NFTMovementSettings,
    solTokenContractEntity: SolanaTokenContract,
  ): Promise<SolanaNftTransfer[]> {
    const gameId = accountWhoInitializeMint.game_id;
    const lastNftTransfer =
      await this.nftTransferRepository.findLastTransferByMint(nftAccount.mint);

    const nftMovement = await this.getNftMovementList(
      nftAccount,
      settings,
      1,
      accountWhoInitializeMint,
      lastNftTransfer,
    );

    const result = [];
    for (let i = 0; i < nftMovement.length; i++) {
      const transfer = nftMovement[i];
      const createdAt = transfer.time * 1000;

      const { isPlayerFromAccount, isPlayerToAccount } =
        SolanaGameParserService.getIsPlayerFlagsByAccount(
          gameAddressList,
          transfer.realPrevOwner,
          transfer.owner,
        );

      const nftTransferEntity = new SolanaNftTransfer();

      const fromAccountId = await this.getAccountIdByAddress(
        transfer.realPrevOwner,
        gameId,
        createdAt,
        isPlayerFromAccount,
      );

      const toAccountId = await this.getAccountIdByAddress(
        transfer.owner,
        gameId,
        createdAt,
        isPlayerToAccount,
      );

      nftTransferEntity.from_account_id = fromAccountId;
      nftTransferEntity.to_account_id = toAccountId;
      nftTransferEntity.token_id = transfer.mint;
      nftTransferEntity.buyer_amount = transfer.buyerAmount.toString();
      nftTransferEntity.seller_amount = transfer.sellerAmount.toString();
      nftTransferEntity.created_at = new Date(createdAt);
      nftTransferEntity.transaction_hash = transfer.signature;
      nftTransferEntity.game_id = gameId;
      nftTransferEntity.token_contract_id =
        transfer.tokenContractId === 0
          ? solTokenContractEntity.id
          : transfer.tokenContractId;

      result.push(nftTransferEntity);
    }

    return result;
  }

  private async getNftMovementList(
    nftAccount: SolanaAssociatedTokenAccount,
    settings: NFTMovementSettings,
    attempt: number,
    accountWhoInitializeMint: SolanaAccount,
    lastNftTransfer?: SolanaNftTransfer,
  ) {
    if (attempt > 1) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }

    try {
      if (!lastNftTransfer) {
        return await this.calculateNftMovement(
          accountWhoInitializeMint,
          nftAccount,
          settings,
        );
      } else {
        return await this.calculateNftMovementWithLastNftTransfer(
          nftAccount,
          lastNftTransfer,
          settings,
        );
      }
    } catch (e) {
      if (attempt > 2) {
        return [];
      }

      return this.getNftMovementList(
        nftAccount,
        settings,
        attempt + 1,
        accountWhoInitializeMint,
        lastNftTransfer,
      );
    }
  }

  private async getNftMovement(
    firstOwner,
    mintAccount,
    signatures,
    isThisSignaturesForMintAccount,
    settings: NFTMovementSettings,
  ) {
    let signatureList = signatures;
    const transfers = [];
    const account2Signature = new Map();

    transfers.push(firstOwner);

    if (isThisSignaturesForMintAccount) {
      account2Signature.set(mintAccount, signatureList);
    } else {
      account2Signature.set(firstOwner.account, signatureList);
    }

    const maxTransferList = 100;

    while (
      transfers[transfers.length - 1].owner !== '' &&
      transfers.length < maxTransferList
    ) {
      const prevOwner = transfers[transfers.length - 1];

      if (account2Signature.has(prevOwner.account)) {
        let flag = true;
        signatureList = account2Signature.get(prevOwner.account).filter((s) => {
          if (s.signature === prevOwner.signature) {
            flag = false;
          }

          return flag;
        });
      } else {
        signatureList = await SolanaGameParserService.getAllSignatureForAddress(
          prevOwner.account,
          {
            until: prevOwner.signature,
          },
        );

        account2Signature.set(prevOwner.account, signatureList);
      }

      const firstOwner = await this.findFirstOwner(
        signatureList,
        mintAccount,
        transfers,
        settings,
      );

      transfers.push(firstOwner);
    }

    return transfers
      .filter((t) => t.owner !== '')
      .filter((t) => t.realPrevOwner !== undefined)
      .filter(
        (t) =>
          t.type === SolanaNftTypeMovement.TRANSFER ||
          t.type === SolanaNftTypeMovement.PURCHASE,
      );
  }

  private async calculateNftMovementWithLastNftTransfer(
    nftAccount: SolanaAssociatedTokenAccount,
    lastNftTransfer: SolanaNftTransfer,
    settings: NFTMovementSettings,
  ) {
    const toAccountEntity = await this.accountRepository.findById(
      lastNftTransfer.to_account_id,
    );

    if (!toAccountEntity) {
      return;
    }

    const mintAccount = nftAccount.mint;

    const firstOwner = {
      owner: toAccountEntity.address,
      account: await SolanaGameParserService.findAssociatedTokenAddress(
        toAccountEntity.address,
        mintAccount,
      ),
      signature: lastNftTransfer.transaction_hash,
      mint: mintAccount,
      type: SolanaNftTypeMovement.MINT,
      tokenContractId: 0,
    };

    const signatureList =
      await SolanaGameParserService.getAllSignatureForAddress(
        firstOwner.account,
        { until: firstOwner.signature },
      );

    return await this.getNftMovement(
      firstOwner,
      mintAccount,
      signatureList,
      false,
      settings,
    );
  }

  private static async findAssociatedTokenAddress(
    walletAddress: string,
    tokenMintAddress: string,
  ): Promise<string> {
    const walletPublicKey = new PublicKey(walletAddress);

    const tokenMintPublicKey = new PublicKey(tokenMintAddress);

    const tokenPda = (
      await PublicKey.findProgramAddress(
        [
          walletPublicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenMintPublicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID,
      )
    )[0];

    return tokenPda.toBase58();
  }

  private async calculateNftMovement(
    accountWhoInitializeMint: SolanaAccount,
    nftAccount: SolanaAssociatedTokenAccount,
    settings: NFTMovementSettings,
  ) {
    const mintAccount = nftAccount.mint;
    const signatureList =
      await SolanaGameParserService.getAllSignatureForAddress(mintAccount);
    const firstOwner = await this.findFirstOwner(
      signatureList,
      mintAccount,
      [],
      settings,
    );

    if (firstOwner.owner !== accountWhoInitializeMint.address) {
      nftAccount.type = SolanaAssociatedTokenAccountType.UNUSED;
      await this.associatedTokenAccountRepository.save(nftAccount);
      return [];
    }

    return await this.getNftMovement(
      firstOwner,
      mintAccount,
      signatureList,
      true,
      settings,
    );
  }

  private async findFirstOwner(
    signatureList: ConfirmedSignatureInfo[],
    mintAccount: string,
    transfers = [],
    settings: NFTMovementSettings,
  ): Promise<any> {
    const apiClient = SolanaGameParserService.getApiClient();
    const prevOwner = transfers[transfers.length - 1] || {};
    const onlyTransferAndPurchase = transfers.filter(
      (t) =>
        t.type === SolanaNftTypeMovement.TRANSFER ||
        t.type === SolanaNftTypeMovement.PURCHASE ||
        t.type === SolanaNftTypeMovement.MINT,
    );
    const realPrevOwner =
      onlyTransferAndPurchase[onlyTransferAndPurchase.length - 1] || {};
    const tokenAddress2TokenIdForPayment =
      settings.tokenAddress2TokenIdForPayment || {};
    const marketPlaceList = settings.marketplaceList || [];

    const result = {
      owner: '',
      account: '',
      signature: '',
      prevOwner: prevOwner.owner,
      realPrevOwner: realPrevOwner.owner,
      mint: '',
      block: 0,
      time: 0,
      type:
        transfers.length === 0
          ? SolanaNftTypeMovement.MINT
          : SolanaNftTypeMovement.UNKNOWN,
      buyerAmount: 0,
      sellerAmount: 0,
      tokenContractId: 0,
    };

    for (let j = signatureList.length - 1; j > -1; j--) {
      if (result.owner !== '') {
        continue;
      }

      const tx = await apiClient.getParsedTransaction(
        signatureList[j].signature,
      );
      if (!tx?.meta?.postTokenBalances) {
        continue;
      }

      if (!tx.meta.postTokenBalances.length) {
        continue;
      }

      let hasTransfer: any = true;
      if (prevOwner.owner) {
        hasTransfer = tx.meta.postTokenBalances
          .filter((t) => t.owner === prevOwner.owner)
          .reduce((acc, curr) => {
            if (curr.uiTokenAmount.amount === '1') {
              acc = false;
            }

            return acc;
          }, hasTransfer);
      }

      if (!hasTransfer) {
        continue;
      }

      let data = tx.meta.postTokenBalances.filter(
        (t) => t.mint === mintAccount,
      );

      if (prevOwner.owner) {
        data = data.filter((t) => t.owner !== prevOwner.owner);
      }

      if (!data.length) {
        this.logger.error('---- Data empty ----');
        this.logger.error(
          `Data empty: signature: ${signatureList[j].signature}`,
        );
        this.logger.error('Data empty: tx.meta.postTokenBalances: ');
        this.logger.error(tx.meta.postTokenBalances);
        throw Error('Data empty');
      }

      result.owner = data[0].owner;
      result.account =
        tx.transaction.message.accountKeys[
          data[0].accountIndex
        ].pubkey.toBase58();
      result.signature = signatureList[j].signature;
      result.mint = data[0].mint;
      result.block = tx.slot;
      result.time = tx.blockTime;
      result.type =
        prevOwner.account === result.account
          ? SolanaNftTypeMovement.CHANGE_AUTHORITY
          : result.type;

      const instructionList = SolanaGameParserService.prepareInstructionList(
        tx,
        [TOKEN_PROGRAM_ID.toBase58(), SystemProgram.programId.toBase58()],
      );

      let isTransfer = false;
      let buyerAmount = 0;
      let sellerAmount = 0;

      const accountList = tx.transaction.message.accountKeys.map((r) =>
        r.pubkey.toBase58(),
      );
      const wallet2OwnerAndTokenId = [
        ...tx.meta.postTokenBalances,
        ...tx?.meta?.preTokenBalances,
      ]
        .filter((tb) => tokenAddress2TokenIdForPayment[tb.mint] > 0)
        .reduce((acc, curr) => {
          acc[accountList[curr.accountIndex]] = {
            owner: curr.owner,
            tokenContractId: tokenAddress2TokenIdForPayment[curr.mint],
          };

          return acc;
        }, {});

      for (let k = 0; k < instructionList.length; k++) {
        const instruction = instructionList[k];
        const info = instruction?.parsed?.info;
        const type = instruction.parsed?.type;

        if (instruction.programId.toBase58() === TOKEN_PROGRAM_ID.toBase58()) {
          const amount =
            type === 'transferChecked'
              ? parseInt(info.tokenAmount?.amount, 10)
              : parseInt(info.amount, 10);

          if (
            info.source === prevOwner.account &&
            info.destination === result.account &&
            amount === 1
          ) {
            isTransfer = true;
          }

          if (Object.keys(wallet2OwnerAndTokenId).length) {
            const ownerSource = wallet2OwnerAndTokenId[info.source];
            const ownerDestination = wallet2OwnerAndTokenId[info.destination];

            if (ownerSource && ownerDestination) {
              if (ownerSource.owner === result.owner) {
                buyerAmount += amount;
                result.tokenContractId = ownerSource.tokenContractId;
              }

              if (ownerDestination.owner === realPrevOwner.owner) {
                sellerAmount += amount;
                result.tokenContractId = ownerSource.tokenContractId;
              }
            }
          }
        } else if (
          instruction.programId.toBase58() ===
          SystemProgram.programId.toBase58()
        ) {
          if (type !== 'transfer') {
            this.logger.error('---- Not Transfer ----');
            this.logger.error('tx.transaction.signatures: ');
            this.logger.error(tx.transaction.signatures);
            this.logger.error('instruction info: ');
            this.logger.error(info);
            this.logger.error('instruction type: ');
            this.logger.error(type);
            this.logger.error('---- Not Transfer ----');
            throw Error('Not Transfer');
          }

          const lamports = parseInt(info.lamports, 10);
          if (info.source === result.owner) {
            buyerAmount += lamports;
            result.tokenContractId = 0;
          }

          if (info.destination === realPrevOwner.owner) {
            sellerAmount += lamports;
            result.tokenContractId = 0;
          }
        }
      }

      if (marketPlaceList.includes(result.owner)) {
        result.type = SolanaNftTypeMovement.CHANGE_AUTHORITY;
      } else if (isTransfer && sellerAmount > 0 && buyerAmount > 0) {
        result.type = SolanaNftTypeMovement.PURCHASE;
        result.buyerAmount = buyerAmount;
        result.sellerAmount = sellerAmount;
      } else if (isTransfer) {
        result.type = SolanaNftTypeMovement.TRANSFER;
      }
    }

    return result;
  }

  private static async getAllSignatureForAddress(
    address: string,
    templateOptions = {},
  ): Promise<ConfirmedSignatureInfo[]> {
    const apiClient = SolanaGameParserService.getApiClient();

    let signatureList: ConfirmedSignatureInfo[] = [];
    let signaturesForAddress = await apiClient.getSignaturesForAddress(
      new PublicKey(address),
      templateOptions,
    );
    while (signaturesForAddress.length !== 0) {
      signatureList = [...signatureList, ...signaturesForAddress];
      const options = {
        ...templateOptions,
        before: signaturesForAddress[signaturesForAddress.length - 1].signature,
      };
      signaturesForAddress = await apiClient.getSignaturesForAddress(
        new PublicKey(address),
        options,
      );
    }

    return signatureList.filter((s) => s.err === null);
  }

  private async prepareCoinTransferListForSaving(
    tx: ParsedTransactionWithMeta,
    tokenMintAccount: string,
    tokenContractEntityId: number,
    gameId: number,
    gameAddressList: string[],
  ): Promise<SolanaAccountTransaction[]> {
    const preparedTransfers = [];
    const accountList = tx.transaction.message.accountKeys.map((r) =>
      r.pubkey.toBase58(),
    );

    const wallet2Owner = [
      ...tx.meta.postTokenBalances,
      ...tx.meta.preTokenBalances,
    ]
      .filter((tb) => tb.mint === tokenMintAccount)
      .reduce((acc, curr) => {
        acc[accountList[curr.accountIndex]] = curr.owner;

        return acc;
      }, {});

    if (!Object.keys(wallet2Owner).length) {
      return [];
    }

    const instructionList = SolanaGameParserService.prepareInstructionList(tx, [
      TOKEN_PROGRAM_ID.toBase58(),
    ]);

    for (let j = 0; j < instructionList.length; j++) {
      const info = instructionList[j].parsed?.info;
      const amount =
        instructionList[j].parsed?.type === 'transferChecked'
          ? parseInt(info.tokenAmount?.amount, 10)
          : parseInt(info.amount, 10);

      const ownerSource = wallet2Owner[info.source];
      const ownerDestination = wallet2Owner[info.destination];

      if (!ownerSource || !ownerDestination) {
        continue;
      }

      if (
        !gameAddressList.includes(ownerSource) &&
        !gameAddressList.includes(ownerDestination)
      ) {
        continue;
      }

      const transfer = await this.prepareTransfer(
        ownerSource,
        ownerDestination,
        gameId,
        amount,
        tx,
        tokenContractEntityId,
        gameAddressList,
      );

      preparedTransfers.push(transfer);
    }

    return preparedTransfers;
  }

  private async prepareTransfer(
    ownerSource: string,
    ownerDestination: string,
    gameId: number,
    amount: number,
    tx: ParsedTransactionWithMeta,
    tokenContractEntityId: number,
    gameAddressList: string[],
  ): Promise<SolanaAccountTransaction> {
    const transfer = new SolanaAccountTransaction();
    const createdAt = tx.blockTime * 1000;

    const { isPlayerFromAccount, isPlayerToAccount } =
      SolanaGameParserService.getIsPlayerFlagsByAccount(
        gameAddressList,
        ownerSource,
        ownerDestination,
      );

    const fromAccountId = await this.getAccountIdByAddress(
      ownerSource,
      gameId,
      createdAt,
      isPlayerFromAccount,
    );

    const toAccountId = await this.getAccountIdByAddress(
      ownerDestination,
      gameId,
      createdAt,
      isPlayerToAccount,
    );

    transfer.from_account_id = fromAccountId;
    transfer.to_account_id = toAccountId;
    transfer.amount = amount.toString();
    transfer.created_at = new Date(createdAt);
    transfer.transaction_hash = tx.transaction.signatures[0];
    transfer.token_contract_id = tokenContractEntityId;
    transfer.game_id = gameId;
    transfer.transaction_type = SolanaAccountTransactionTransferType.TRANSFER;

    return transfer;
  }

  private static prepareInstructionList(
    tx: ParsedTransactionWithMeta,
    programIds: string[],
  ): ParsedInstruction[] {
    const instructionList = SolanaGameParserService.filterInstructionList(
      tx.transaction.message.instructions,
      programIds,
    );

    let innerInstruction = [];
    if (tx.meta?.innerInstructions) {
      innerInstruction = tx.meta.innerInstructions
        .map((i) => {
          return SolanaGameParserService.filterInstructionList(
            i.instructions,
            programIds,
          );
        })
        .reduce((acc, cur) => {
          acc = [...acc, ...cur];
          return acc;
        }, []);
    }

    return [...instructionList, ...innerInstruction];
  }

  private static filterInstructionList(
    instructionList,
    programIds: string[],
  ): ParsedInstruction[] {
    return instructionList
      .filter((i) => programIds.includes(i.programId.toBase58()))
      .filter((i) => !!i.parsed)
      .filter((i) => {
        return i.parsed?.type.toLowerCase().includes('transfer');
      });
  }

  private static getParsedTransactionList(
    signatureList: SolanaSignature[],
    connection,
  ): Promise<ParsedTransactionWithMeta[]> {
    const requests = [];
    for (let idx = 0; idx < signatureList.length; idx++) {
      const transaction = signatureList[idx];
      if (transaction.is_failed) {
        continue;
      }

      requests.push(connection.getParsedTransaction(transaction.signature));
    }

    return Promise.all(requests);
  }

  private async getAccountIdByAddress(
    address: string,
    gameId: number,
    firstTimeMilliseconds: number,
    isPlayer: boolean,
  ): Promise<number> {
    const id = await this.getAccountId(
      address,
      gameId,
      firstTimeMilliseconds,
      isPlayer,
    );

    if (id) {
      return id;
    }

    const newAccount = new SolanaAccount();

    newAccount.first_time = new Date(firstTimeMilliseconds);
    newAccount.address = address;
    newAccount.game_id = gameId;
    newAccount.is_contract = false;
    newAccount.is_player = isPlayer;

    try {
      await this.accountRepository.save(newAccount);
    } catch (e) {
      const id = await this.getAccountId(
        address,
        gameId,
        firstTimeMilliseconds,
        isPlayer,
      );

      if (!id) {
        throw e;
      }

      return id;
    }

    return newAccount.id;
  }

  private async getAccountId(
    address: string,
    gameId: number,
    firstTimeMilliseconds: number,
    isPlayer: boolean,
  ): Promise<number | null> {
    const account = await this.accountRepository.findUnique(address, gameId);
    if (account) {
      if (account.first_time.getTime() > firstTimeMilliseconds) {
        await this.accountRepository.updateFirstTime(
          account.id,
          firstTimeMilliseconds,
        );
      }

      if (isPlayer && !account.is_player) {
        account.is_player = isPlayer;
        await this.accountRepository.save(account);
      }

      return account.id;
    }

    return null;
  }

  private async saveNewSignature(
    publicKey: string,
    options: SignaturesForAddressOptions,
    associatedTokenAccountId?: number,
    accountId?: number,
  ) {
    const apiClient = SolanaGameParserService.getApiClient();
    let signatureList = await apiClient.getSignaturesForAddress(
      new PublicKey(publicKey),
      options,
    );

    let isNewFirstSignature = Object.keys(options).length === 0;
    let attempt = 0;

    while (signatureList.length !== 0 && attempt < 3) {
      this.logger.log(`Start new save signature iteration for "${publicKey}".`);

      let signatureEntityList = [];

      for (let idx = 0; idx < signatureList.length; idx++) {
        const modelFromResponse = signatureList[idx];

        const entity = new SolanaSignature();
        entity.signature = modelFromResponse.signature;
        entity.slot = modelFromResponse.slot;
        entity.is_failed = !!modelFromResponse.err;
        entity.block_time = modelFromResponse.blockTime;

        entity.state = SolanaSignatureStateEnum.NEW;
        if (isNewFirstSignature) {
          entity.state = SolanaSignatureStateEnum.NEW_FIRST_SIGNATURE;
          isNewFirstSignature = false;
        }

        entity.solana_associated_token_account_id = associatedTokenAccountId;
        entity.account_id = accountId;

        signatureEntityList.push(entity);
      }

      signatureEntityList = await this.removeDuplicateSignatures(
        signatureEntityList,
      );
      if (signatureEntityList.length) {
        await this.signatureRepository.multipleInsert(signatureEntityList);
      } else {
        attempt++;
      }

      signatureList = await apiClient.getSignaturesForAddress(
        new PublicKey(publicKey),
        {
          ...options,
          before: signatureList[signatureList.length - 1].signature,
        },
      );
    }
  }

  private async removeDuplicateSignatures(
    signatureEntityList: SolanaSignature[],
  ): Promise<SolanaSignature[]> {
    const dbSignatureList = await this.signatureRepository.findDuplicateFor(
      signatureEntityList,
    );

    if (!dbSignatureList.length) {
      return signatureEntityList;
    }

    return signatureEntityList.filter(
      (s) =>
        !dbSignatureList.some(
          (dbS) =>
            dbS.signature === s.signature &&
            dbS.slot === s.slot &&
            dbS.account_id === s.account_id &&
            dbS.solana_associated_token_account_id ===
              s.solana_associated_token_account_id,
        ),
    );
  }

  private async getUnmarkedAssociatedAccounts(accountId) {
    return this.associatedTokenAccountRepository.findByTypeAndAccountId(
      SolanaAssociatedTokenAccountType.UNKNOWN,
      accountId,
      250,
    );
  }

  private async saveNewAssociatedAccounts(
    associatedAccounts: TokenAccount[],
    ownerAccountEntity: SolanaAccount,
  ): Promise<boolean> {
    const decodedAccountsInfo: DecodedAccountInfo[] = associatedAccounts.map(
      (aa) => {
        const accountInfo = AccountLayout.decode(aa.account.data);

        const mint = accountInfo.mint.toBase58();
        const associatedTokenAccountPublicKey = aa.pubkey.toBase58();

        return {
          decodedAccountInfo: accountInfo,
          tokenAccountInfo: {
            mint,
            associated_token_account: associatedTokenAccountPublicKey,
            account_id: ownerAccountEntity.id,
          },
        };
      },
    );

    const dbAssociatedAccounts =
      await this.associatedTokenAccountRepository.findByTokenAccountsInfo(
        decodedAccountsInfo.map((dai) => dai.tokenAccountInfo),
      );

    if (dbAssociatedAccounts.length === decodedAccountsInfo.length) {
      return true;
    }

    const newAccountList = decodedAccountsInfo.filter((tai) => {
      return !dbAssociatedAccounts.some(
        (daa) =>
          daa.mint === tai.tokenAccountInfo.mint &&
          daa.account_id === tai.tokenAccountInfo.account_id &&
          daa.associated_token_account ===
            tai.tokenAccountInfo.associated_token_account,
      );
    });

    const newAccountListEntityList = [];
    for (const newAccount of newAccountList) {
      const type =
        newAccount.decodedAccountInfo.amount === 1n ||
        newAccount.decodedAccountInfo.amount === 0n
          ? SolanaAssociatedTokenAccountType.UNKNOWN
          : SolanaAssociatedTokenAccountType.COIN;

      const associatedTokenAccountEntity = new SolanaAssociatedTokenAccount();

      associatedTokenAccountEntity.associated_token_account =
        newAccount.tokenAccountInfo.associated_token_account;
      associatedTokenAccountEntity.account_id = ownerAccountEntity.id;
      associatedTokenAccountEntity.mint = newAccount.tokenAccountInfo.mint;
      associatedTokenAccountEntity.type = type;

      newAccountListEntityList.push(associatedTokenAccountEntity);
    }

    if (newAccountListEntityList.length) {
      await this.associatedTokenAccountRepository.multipleInsert(
        newAccountListEntityList,
      );
    }

    return true;
  }

  async restorePreviousInProgressSignatureList(
    gameTokenAddressList: GameTokenAddressList,
    gameId: number,
  ): Promise<void> {
    const gameTokenAddressObjectList = await this.findGameTokenAddressList(
      gameTokenAddressList,
    );

    if (!gameTokenAddressObjectList) {
      return;
    }

    const previousInProgressSignatureList =
      await this.getPreviousInProgressSignatureList(gameTokenAddressObjectList);

    if (previousInProgressSignatureList.length) {
      await this.accountTransactionRepository.deleteTransferList(
        gameId,
        previousInProgressSignatureList,
      );

      await this.restoreSignatureList(
        previousInProgressSignatureList,
        gameTokenAddressObjectList,
      );
    }
  }

  private async restoreSignatureList(
    signatureList: SolanaSignature[],
    gameTokenAddressObjectList: GameTokenAddressObjectList,
  ): Promise<void> {
    const associatedTokenAddressIds =
      gameTokenAddressObjectList.associatedTokenAddressList.map((e) => e.id);
    const accountTokenAddressIds =
      gameTokenAddressObjectList.accountAddressList.map((e) => e.id);

    for (const signatureObj of signatureList) {
      const fullSignatureListForAllGameAccounts =
        await this.signatureRepository.findBySignature(
          signatureObj.signature,
          associatedTokenAddressIds,
          accountTokenAddressIds,
        );

      await this.signatureRepository.changeStateToNew(
        fullSignatureListForAllGameAccounts,
      );
    }
  }

  private async getPreviousInProgressSignatureList(
    gameTokenAddressList: GameTokenAddressObjectList,
  ): Promise<SolanaSignature[]> {
    let result = [];

    if (gameTokenAddressList.associatedTokenAddressList.length) {
      const previousInProgressSignatureList =
        await this.signatureRepository.findInProgressSignatureListByAssociatedTokenAccountList(
          gameTokenAddressList.associatedTokenAddressList.map((e) => e.id),
        );

      result = [...result, ...previousInProgressSignatureList];
    }

    if (gameTokenAddressList.accountAddressList.length) {
      const previousInProgressSignatureList =
        await this.signatureRepository.findInProgressSignatureListByAccountList(
          gameTokenAddressList.accountAddressList.map((e) => e.id),
        );

      result = [...result, ...previousInProgressSignatureList];
    }

    return result;
  }

  private async findGameTokenAddressList(
    gameTokenAddressList: GameTokenAddressList,
  ): Promise<GameTokenAddressObjectList | undefined> {
    const result = {
      associatedTokenAddressList: [],
      accountAddressList: [],
    };

    if (gameTokenAddressList.associatedTokenAddressList.length) {
      const associatedTokenAddressList =
        await this.associatedTokenAccountRepository.findByAssociatedTokenAccountList(
          gameTokenAddressList.associatedTokenAddressList,
        );

      if (
        gameTokenAddressList.associatedTokenAddressList.length !==
        associatedTokenAddressList.length
      ) {
        this.logger.error(
          `gameTokenAddressList.associatedTokenAddressList.length !== associatedTokenAddressList.length for "${gameTokenAddressList.associatedTokenAddressList.join(
            ', ',
          )}"`,
        );
        return;
      }

      result.associatedTokenAddressList = associatedTokenAddressList;
    }

    if (gameTokenAddressList.accountAddressList.length) {
      const accountAddressList = await this.accountRepository.findByAccountList(
        gameTokenAddressList.accountAddressList,
      );

      if (
        gameTokenAddressList.accountAddressList.length !==
        accountAddressList.length
      ) {
        this.logger.error(
          `gameTokenAddressList.accountAddressList.length !== accountAddressList.length for "${gameTokenAddressList.accountAddressList.join(
            ', ',
          )}"`,
        );
        return;
      }

      result.accountAddressList = accountAddressList;
    }

    return result;
  }

  private static getIsPlayerFlagsByAccount(
    gameAddressList: string[],
    fromAccount: string,
    toAccount: string,
  ) {
    const isPlayerFromAccount =
      !gameAddressList.includes(fromAccount) &&
      gameAddressList.includes(toAccount);
    const isPlayerToAccount =
      gameAddressList.includes(fromAccount) &&
      !gameAddressList.includes(toAccount);

    return { isPlayerFromAccount, isPlayerToAccount };
  }

  private static getApiClient() {
    return new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
  }
}
