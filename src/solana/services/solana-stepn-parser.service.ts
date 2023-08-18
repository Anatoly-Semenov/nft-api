import { Injectable, Logger } from '@nestjs/common';
import { SolanaGameParserService } from './solana-game-parser.service';
import { SolanaGameIdEnum } from '../enums/solana-game-id.enum';

const GST = 'GST';
const GMT = 'GMT';
const USDC = 'USDC';

const STEPN_MAIN_ACCOUNT = 'STEPNq2UGeGSzCyGVr2nMQAzf8xuejwqebd84wcksCK';

const MAP_STEPN_TOKEN_ACCOUNT_2_MINT = new Map([
  [
    GMT,
    {
      associatedAccount: 'HhXAKYmRzBNi7BjkDs2fbwJ49mnpWUtzyXEf8PAMArs4',
      mint: '7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx',
    },
  ],
  [
    USDC,
    {
      associatedAccount: 'EBezpYqVsPfrMyyt1fHRqLVkCNkBGeTnkepe4YFdQnBp',
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    },
  ],
  [
    GST,
    {
      associatedAccount: 'HLS5Y68QSQgJP7wUbbbbCjEnMknVZrHXYDwwVaDcsdK7',
      mint: 'AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB',
    },
  ],
]);

@Injectable()
export class SolanaStepnParserService {
  private readonly logger = new Logger(SolanaStepnParserService.name);

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
      this.saveNewSignatureListForGmt(),
      this.saveNewSignatureListForStepn(),
      this.saveNewSignatureListForGst(),
      this.saveNewSignatureListForUsdc(),
    ]);

    return result.every((r) => r);
  }

  private async saveNewTransferList(): Promise<boolean> {
    await this.restorePreviousInProgressSignatureList();

    const result = await Promise.all([
      this.saveNewGmtTransferList(),
      this.saveNewStepnTransferList(),
      this.saveNewGstTransferList(),
      this.saveNewUsdcTransferList(),
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
        STEPN_MAIN_ACCOUNT,
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
        STEPN_MAIN_ACCOUNT,
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

  private saveNewSignatureListForGst(): Promise<boolean> {
    const gstInfo = MAP_STEPN_TOKEN_ACCOUNT_2_MINT.get(GST);

    return this.saveNewSignatureListForAssociatedAccount(
      'saveNewSignatureListForGst',
      gstInfo.associatedAccount,
    );
  }

  private saveNewSignatureListForGmt(): Promise<boolean> {
    const gmtInfo = MAP_STEPN_TOKEN_ACCOUNT_2_MINT.get(GMT);

    return this.saveNewSignatureListForAssociatedAccount(
      'saveNewSignatureListForGmt',
      gmtInfo.associatedAccount,
    );
  }

  private saveNewSignatureListForUsdc(): Promise<boolean> {
    const usdcInfo = MAP_STEPN_TOKEN_ACCOUNT_2_MINT.get(USDC);

    return this.saveNewSignatureListForAssociatedAccount(
      'saveNewSignatureListForUSDC',
      usdcInfo.associatedAccount,
    );
  }

  private async saveNewSignatureListForStepn(): Promise<boolean> {
    const debugStartDate = new Date();
    this.logger.log(
      `Method "saveNewSignatureListForStepn" was ran. Start date ${debugStartDate}.`,
    );

    try {
      await this.solanaGameParserService.saveNewSignatureListForAccount(
        STEPN_MAIN_ACCOUNT,
      );

      this.logger.log(
        `Method "saveNewSignatureListForStepn" was successfully completed. Start date ${debugStartDate}. End date ${new Date()}.`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "saveNewSignatureListForStepn" throw error: ${reason}. Start date ${debugStartDate}. End date ${new Date()}.`,
      );

      return false;
    }

    return true;
  }

  private saveNewGstTransferList(): Promise<boolean> {
    const gstInfo = MAP_STEPN_TOKEN_ACCOUNT_2_MINT.get(GST);
    return this.saveNewCoinTransferList(
      'saveNewGstTransferList',
      gstInfo.mint,
      gstInfo.associatedAccount,
    );
  }

  private saveNewGmtTransferList(): Promise<boolean> {
    const gmtInfo = MAP_STEPN_TOKEN_ACCOUNT_2_MINT.get(GMT);
    return this.saveNewCoinTransferList(
      'saveNewGmtTransferList',
      gmtInfo.mint,
      gmtInfo.associatedAccount,
    );
  }

  private saveNewUsdcTransferList(): Promise<boolean> {
    const usdcInfo = MAP_STEPN_TOKEN_ACCOUNT_2_MINT.get(USDC);
    return this.saveNewCoinTransferList(
      'saveNewUsdcTransferList',
      usdcInfo.mint,
      usdcInfo.associatedAccount,
    );
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
            MAP_STEPN_TOKEN_ACCOUNT_2_MINT.get(USDC).associatedAccount,
            MAP_STEPN_TOKEN_ACCOUNT_2_MINT.get(GMT).associatedAccount,
            MAP_STEPN_TOKEN_ACCOUNT_2_MINT.get(GST).associatedAccount,
          ],
          accountAddressList: [STEPN_MAIN_ACCOUNT],
        },
        SolanaGameIdEnum.STEPN,
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

  private async saveNewStepnTransferList(): Promise<boolean> {
    const debugStartDate = new Date();
    this.logger.log(
      `Method "saveNewSolTransferList" was ran. Start date ${debugStartDate}.`,
    );

    try {
      await this.solanaGameParserService.saveNewSolTransferList(
        STEPN_MAIN_ACCOUNT,
        [STEPN_MAIN_ACCOUNT],
      );

      this.logger.log(
        `Method "saveNewSolTransferList" was successfully completed. Start date ${debugStartDate}. End date ${new Date()}.`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "saveNewSolTransferList" throw error: ${reason}. Start date ${debugStartDate}. End date ${new Date()}.`,
      );

      return false;
    }

    return true;
  }

  private async saveNewNftMovement(): Promise<boolean> {
    const debugStartDate = new Date();
    this.logger.log(
      `Method "saveNewNftMovement" was ran. Start date ${debugStartDate}.`,
    );

    try {
      await this.solanaGameParserService.saveNewNftMovement(
        STEPN_MAIN_ACCOUNT,
        [STEPN_MAIN_ACCOUNT],
        [],
      );

      this.logger.log(
        `Method "saveNewNftMovement" was successfully completed. Start date ${debugStartDate}. End date ${new Date()}.`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "saveNewNftMovement" throw error: ${reason}. Start date ${debugStartDate}. End date ${new Date()}.`,
      );

      return false;
    }

    return true;
  }

  private async saveNewCoinTransferList(
    methodName: string,
    mint: string,
    associatedAccount: string,
  ): Promise<boolean> {
    const debugStartDate = new Date();
    this.logger.log(
      `Method "${methodName}" was ran. Args: mint = "${mint}", associatedAccount = "${associatedAccount}". Start date ${debugStartDate}.`,
    );

    try {
      await this.solanaGameParserService.saveNewCoinTransferList(
        mint,
        associatedAccount,
        [STEPN_MAIN_ACCOUNT],
      );

      this.logger.log(
        `Method "${methodName}" was successfully completed. Args: mint = "${mint}", associatedAccount = "${associatedAccount}". Start date ${debugStartDate}. End date ${new Date()}.`,
      );
    } catch (reason) {
      this.logger.error(
        `Method "${methodName}" throw error: ${reason}. Start date ${debugStartDate}. End date ${new Date()}. Args: mint = "${mint}", associatedAccount = "${associatedAccount}".`,
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
