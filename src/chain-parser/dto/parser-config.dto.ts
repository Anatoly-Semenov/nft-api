import { GameContract } from '../entities/game-contract.entity';
import { TokenContract } from '../entities/token-contract.entity';
import { GameWallet } from '../entities/game-wallet.entity';
import { ProgressStage } from '../enums/progress-stage.enum';

export class ParserConfigDto {
  gameId: number;
  gameContracts: GameContract[];
  gameAddresses: string[];
  wallets: GameWallet[];
  walletAddresses: string[];
  knownNfts: Set<TokenContract>;
  knownNftAddresses: Set<string>;
  nfts: Set<TokenContract>;
  nftAddresses: Set<string>;
  coins: Set<TokenContract>;
  coinAddresses: Set<string>;
  commonCoins: TokenContract[];
  commonCoinAddresses: string[];
  internalGrabList: GameContract[];
  internalGrabAddressList: string[];
  systemWallets: GameWallet[];
  systemAddressList: string[];
  stepStartDate: Date;
  stepStartValue: number;
  currentStep: ProgressStage;
}
