import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEthereumAddress } from 'class-validator';
import { UserSocialProfile } from '../interfaces/user-social-profile.interface';
import { IsSolanaPublicKey } from '../../common/decorators/IsSolanaPublicKey';
import { RegisterFromEnum } from '../enums/register-from.enum';

export class CreateUserDto {
  @ApiPropertyOptional()
  @IsEthereumAddress()
  readonly walletAddress?: string;

  @ApiPropertyOptional()
  readonly nonce?: string;

  @ApiPropertyOptional()
  @IsSolanaPublicKey()
  readonly solanaAccount?: string;

  @ApiPropertyOptional()
  readonly discord?: UserSocialProfile;

  @ApiPropertyOptional()
  readonly twitter?: UserSocialProfile;

  @ApiPropertyOptional()
  readonly epicGames?: UserSocialProfile;

  @ApiPropertyOptional()
  readonly displayedName?: string;

  @ApiPropertyOptional()
  readonly email?: string;

  @ApiPropertyOptional()
  readonly registerFrom?: RegisterFromEnum;
}
