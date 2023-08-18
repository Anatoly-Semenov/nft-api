import { Injectable, Logger } from '@nestjs/common';
import { SolanaGameParserService } from './solana-game-parser.service';
import { SolanaGameIdEnum } from '../enums/solana-game-id.enum';

const MINTING_ACCOUNT = '7H2uqTLZGF2jtYLjXnz3UCbFdb7aFxVLVyyxnNDKFzjy';
const OLD_MINTING_ACCOUNT = 'HZrhtdSuyBr3GfJ9LTE1LenNPPyvyX3P2SDb4bnafm9h';
const MARKETPLACE_ACCOUNT = 'A2B1w2fpwuJZrF9b69KBFb6Cn4Cp7siKGqQwPBJEGLYj';
const DEPOSIT_ACCOUNT = '6HyVjAUJu1T2EhojQa2bJ83TJ9dUdsXS3wveWh3XrxBN';
const BREEDING_ACCOUNT = '81DTeooGYPrgenBx84faBG2NXvRQnpjjdwDGjL5HpYZn';

const WALKEN_MINT_TOKEN_ACCOUNT = 'EcQCUYv57C4V6RoPxkVUiDwtX1SP8y8FP5AEToYL8Az';

const MAP_ACCOUNT_2_MINT = new Map([
  [
    MARKETPLACE_ACCOUNT,
    {
      [WALKEN_MINT_TOKEN_ACCOUNT]:
        '8KuSo8XT7yvd9ZsqyFeyFEzRx2pPcRTYW2RToNjcZy8X',
    },
  ],
  [
    DEPOSIT_ACCOUNT,
    {
      [WALKEN_MINT_TOKEN_ACCOUNT]:
        '5NwQUi9xmE8LAzZxaU23L6dRgaPd35vJXJX2USFHfYCv',
    },
  ],
  [
    BREEDING_ACCOUNT,
    {
      [WALKEN_MINT_TOKEN_ACCOUNT]:
        'RUcneqVARGF3GMjurB7ksQwxwgdeWDv5PYHwxAubF4B',
    },
  ],
]);

@Injectable()
export class SolanaWalkenParserService {
  private readonly logger = new Logger(SolanaWalkenParserService.name);

  constructor(
    private readonly solanaGameParserService: SolanaGameParserService,
  ) {}

  getParsingMethodList() {
    return [
      this.saveNewSignatureList.bind(this),
      this.saveNewTransferList.bind(this),
      this.parserAssociatedAccountList.bind(this),
      this.saveNewNftMovement.bind(this),
    ];
  }

  async prepareBeforeAggregation(): Promise<void> {
    await this.restorePreviousInProgressSignatureList();
  }

  private async saveNewSignatureList(): Promise<boolean> {
    const result = await Promise.all([
      this.saveNewSignatureListForMarketplaceAccount(),
      this.saveNewSignatureListForDepositAccount(),
      this.saveNewSignatureListForBreedingAccount(),
    ]);

    return result.every((r) => r);
  }

  private async saveNewTransferList(): Promise<boolean> {
    await this.restorePreviousInProgressSignatureList();

    const result = await Promise.all([
      this.saveNewMarketplaceAccountTransferList(),
      this.saveNewDepositAccountTransferList(),
      this.saveNewBreedingAccountTransferList(),
    ]);

    return result.every((r) => r);
  }

  private async parserAssociatedAccountList(): Promise<boolean> {
    const isSavedNewAssociatedAccountList =
      await this.saveNewAssociatedAccountList();
    const isMarked = await this.markAssociatedAccountAsCoinOrNft();

    return isMarked && isSavedNewAssociatedAccountList;
  }

  private async saveNewAssociatedAccountList(): Promise<boolean> {
    const debugStartDate = new Date();
    this.logger.log(
      `Method "saveNewAssociatedAccountList" was ran. Start date ${debugStartDate}`,
    );

    try {
      await this.solanaGameParserService.saveNewAssociatedAccountList(
        MINTING_ACCOUNT,
      );

      this.logger.log(
        `Method "saveNewAssociatedAccountList" was successfully completed. Start date ${debugStartDate}. End date ${new Date()}.`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "saveNewAssociatedAccountList" throw error: ${reason}. Start date ${debugStartDate}. End date ${new Date()}.`,
      );

      return false;
    }

    return true;
  }

  private async markAssociatedAccountAsCoinOrNft(): Promise<boolean> {
    const debugStartDate = new Date();
    this.logger.log(
      `Method "markAssociatedAccountAsCoinOrNft" was ran. Start date ${debugStartDate}`,
    );

    try {
      await this.solanaGameParserService.markAssociatedAccountAsCoinOrNft(
        MINTING_ACCOUNT,
      );
      this.logger.log(
        `Method "markAssociatedAccountAsCoinOrNft" was successfully completed. Start date ${debugStartDate}. End date ${new Date()}.`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "markAssociatedAccountAsCoinOrNft" throw error: ${reason}. Start date ${debugStartDate}. End date ${new Date()}.`,
      );

      return false;
    }

    return true;
  }

  private saveNewSignatureListForDepositAccount(): Promise<boolean> {
    const depositAccountMintList = MAP_ACCOUNT_2_MINT.get(DEPOSIT_ACCOUNT);

    return this.saveNewSignatureListForAssociatedAccount(
      'saveNewSignatureListForDepositAccount',
      depositAccountMintList[WALKEN_MINT_TOKEN_ACCOUNT],
    );
  }

  private saveNewSignatureListForMarketplaceAccount(): Promise<boolean> {
    const marketplaceAccountMintList =
      MAP_ACCOUNT_2_MINT.get(MARKETPLACE_ACCOUNT);

    return this.saveNewSignatureListForAssociatedAccount(
      'saveNewSignatureListForMarketplaceAccount',
      marketplaceAccountMintList[WALKEN_MINT_TOKEN_ACCOUNT],
    );
  }

  private saveNewSignatureListForBreedingAccount(): Promise<boolean> {
    const breedingAccountMintList = MAP_ACCOUNT_2_MINT.get(BREEDING_ACCOUNT);

    return this.saveNewSignatureListForAssociatedAccount(
      'saveNewSignatureListForBreedingAccount',
      breedingAccountMintList[WALKEN_MINT_TOKEN_ACCOUNT],
    );
  }

  private saveNewDepositAccountTransferList(): Promise<boolean> {
    const depositInfo = MAP_ACCOUNT_2_MINT.get(DEPOSIT_ACCOUNT);
    return this.saveNewCoinTransferList(
      'saveNewDepositAccountTransferList',
      WALKEN_MINT_TOKEN_ACCOUNT,
      depositInfo[WALKEN_MINT_TOKEN_ACCOUNT],
      DEPOSIT_ACCOUNT,
    );
  }

  private saveNewMarketplaceAccountTransferList(): Promise<boolean> {
    const marketplaceInfo = MAP_ACCOUNT_2_MINT.get(MARKETPLACE_ACCOUNT);
    return this.saveNewCoinTransferList(
      'saveNewMarketplaceAccountTransferList',
      WALKEN_MINT_TOKEN_ACCOUNT,
      marketplaceInfo[WALKEN_MINT_TOKEN_ACCOUNT],
      MARKETPLACE_ACCOUNT,
    );
  }

  private saveNewBreedingAccountTransferList(): Promise<boolean> {
    const breedingInfo = MAP_ACCOUNT_2_MINT.get(BREEDING_ACCOUNT);
    return this.saveNewCoinTransferList(
      'saveNewBreedingAccountTransferList',
      WALKEN_MINT_TOKEN_ACCOUNT,
      breedingInfo[WALKEN_MINT_TOKEN_ACCOUNT],
      BREEDING_ACCOUNT,
    );
  }

  private async saveNewNftMovement(): Promise<boolean> {
    await this._saveNewNftMovement(MINTING_ACCOUNT);
    await this._saveNewNftMovement(OLD_MINTING_ACCOUNT);

    return true;
  }

  private async restorePreviousInProgressSignatureList(): Promise<void> {
    const debugStartDate = new Date();
    this.logger.log(
      `Method "restorePreviousInProgressSignatureList" was ran. Start date ${debugStartDate}.`,
    );

    try {
      await this.solanaGameParserService.restorePreviousInProgressSignatureList(
        {
          associatedTokenAddressList: [
            MAP_ACCOUNT_2_MINT.get(BREEDING_ACCOUNT)[WALKEN_MINT_TOKEN_ACCOUNT],
            MAP_ACCOUNT_2_MINT.get(DEPOSIT_ACCOUNT)[WALKEN_MINT_TOKEN_ACCOUNT],
            MAP_ACCOUNT_2_MINT.get(MARKETPLACE_ACCOUNT)[
              WALKEN_MINT_TOKEN_ACCOUNT
            ],
          ],
          accountAddressList: [],
        },
        SolanaGameIdEnum.WALKEN,
      );

      this.logger.log(
        `Method "restorePreviousInProgressSignatureList" was successfully completed. Start date ${debugStartDate}. End date ${new Date()}.`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "restorePreviousInProgressSignatureList" throw error: ${reason}. Start date ${debugStartDate}. End date ${new Date()}.`,
      );
    }
  }

  private async _saveNewNftMovement(account: string): Promise<void> {
    const debugStartDate = new Date();
    this.logger.log(
      `Method "saveNewNftMovement" was ran. Account "${account}". Start date ${debugStartDate}.`,
    );

    try {
      await this.solanaGameParserService.saveNewNftMovement(
        account,
        [
          MINTING_ACCOUNT,
          OLD_MINTING_ACCOUNT,
          MARKETPLACE_ACCOUNT,
          DEPOSIT_ACCOUNT,
          BREEDING_ACCOUNT,
        ],
        [MARKETPLACE_ACCOUNT],
        [WALKEN_MINT_TOKEN_ACCOUNT],
      );

      this.logger.log(
        `Method "saveNewNftMovement" was successfully completed. Account "${account}". Start date ${debugStartDate}. End date ${new Date()}.`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "saveNewNftMovement" throw error: ${reason}. Account "${account}". Start date ${debugStartDate}. End date ${new Date()}.`,
      );
    }
  }

  private async saveNewCoinTransferList(
    methodName: string,
    mint: string,
    associatedAccount: string,
    gameAddress: string,
  ): Promise<boolean> {
    const debugStartDate = new Date();
    this.logger.log(
      `Method "${methodName}" was ran. Args: mint = "${mint}", associatedAccount = "${associatedAccount}", gameAddress = "${gameAddress}". Start date ${debugStartDate}.`,
    );

    try {
      await this.solanaGameParserService.saveNewCoinTransferList(
        mint,
        associatedAccount,
        [gameAddress],
      );

      this.logger.log(
        `Method "${methodName}" was successfully completed. Args: mint = "${mint}", associatedAccount = "${associatedAccount}", gameAddress = "${gameAddress}". Start date ${debugStartDate}. End date ${new Date()}.`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "${methodName}" throw error: ${reason}. Start date ${debugStartDate}. End date ${new Date()}. Args: mint = "${mint}", associatedAccount = "${associatedAccount}", gameAddress = "${gameAddress}".`,
      );

      return false;
    }

    return true;
  }

  private async saveNewSignatureListForAssociatedAccount(
    methodName: string,
    associatedAccount: string,
  ): Promise<boolean> {
    const debugStartDate = new Date();
    this.logger.log(
      `Method "${methodName}" was ran. Start date ${debugStartDate}. Associated account: ${associatedAccount}`,
    );

    try {
      await this.solanaGameParserService.saveNewSignatureListForAssociatedAccount(
        associatedAccount,
      );
      this.logger.log(
        `Method "${methodName}" was successfully completed. Start date ${debugStartDate}. End date ${new Date()}. Associated account: ${associatedAccount}`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "${methodName}" throw error: ${reason}. Start date ${debugStartDate}. End date ${new Date()}. Associated account: ${associatedAccount}`,
      );

      return false;
    }

    return true;
  }
}
