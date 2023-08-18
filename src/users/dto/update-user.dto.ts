import { UserRole } from '../enums/user-role.emun';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsEthereumAddress, IsOptional } from 'class-validator';
import { UserSocialProfile } from '../interfaces/user-social-profile.interface';
import { IsSolanaPublicKey } from '../../common/decorators/IsSolanaPublicKey';

export class UpdateUserDto {
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
  @IsOptional()
  @IsEnum(UserRole, { each: true })
  readonly role?: UserRole;
}
