import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

// Entities
import { User } from 'src/users/entities/user.entity';

// Services
import { UsersService } from '../users/users.service';
import { ReferralService } from '../referral/referral.service';

// DTO
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateNonceDto } from './dto/create-nonce.dto';
import { FakeAuthDto } from './dto/fake-auth.dto';
import { VerifySignDto } from './dto/verify-sign.dto';

// Types
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { AuthTokens } from './interfaces/auth-tokens.interface';
import type { JWTPayloadOptions } from './types/JWTPayloadOptions';
import type { UserSocialProfile } from '../users/interfaces/user-social-profile.interface';
import { UserSocials } from 'src/users/enums/user-socials.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly referralService: ReferralService,
    private jwtService: JwtService,
  ) {}

  async authUser(
    user: User,
    jwtPayloadOptions?: JWTPayloadOptions,
  ): Promise<AuthTokens> {
    if (!user.id) {
      throw new BadRequestException();
    }

    const payload: JwtPayload = {
      sub: String(user.id),
      walletAddress: jwtPayloadOptions?.walletAddress || user.walletAddress,
      hasMessengerAccess: !!jwtPayloadOptions?.hasMessengerAccess,
    };

    this.usersService
      .checkAchievementsList(user.id.toString())
      .catch(() => null);

    return { accessToken: this.jwtService.sign(payload) };
  }

  async fakeValidate({ id }: FakeAuthDto): Promise<AuthTokens> {
    const user = await this.usersService.findById(id);
    return this.authUser(user);
  }

  async validateUser(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<AuthTokens> {
    const {
      walletAddress,
      solanaAccount,
      solanaSignature,
      referralId = 0,
    } = authCredentialsDto;

    const user = walletAddress
      ? await this.validateMetamaskUser(walletAddress, referralId)
      : await this.validateSolanaUser(
          solanaAccount,
          solanaSignature,
          referralId,
        );

    return this.authUser(user, { walletAddress });
  }

  async verifySign(
    verifySignDto: VerifySignDto,
  ): Promise<{ status: 'success' | 'fail' }> {
    const { signature, nonce, walletAddress } = verifySignDto;

    const user = await this.usersService.findByWalletAddress(walletAddress);

    if (!user) {
      throw new NotFoundException();
    }

    const message = AuthService.getMessageForSign(nonce);
    const addr = ethers.utils.verifyMessage(message, signature);

    const result: { status: 'success' | 'fail' } = { status: 'fail' };

    if (walletAddress.toLowerCase() === addr.toLowerCase()) {
      result.status = 'success';
    }

    return result;
  }

  async createNonce(
    createNonceDto: CreateNonceDto,
  ): Promise<{ nonce: string; user: User }> {
    const {
      walletAddress,
      solanaAccount,
      requestFrom: registerFrom,
      referralId,
    } = createNonceDto;
    const nonce = uuidv4();
    let user = null;

    try {
      user = solanaAccount
        ? await this.usersService.findBySolanaAccount(solanaAccount)
        : await this.usersService.findByWalletAddress(walletAddress);
      await this.usersService.update(String(user.id), { nonce });
    } catch (error) {
      // Create new user
      user = await this.usersService.create({
        walletAddress,
        solanaAccount,
        nonce,
        registerFrom,
      });

      // Set referral data if exist
      if (user && referralId) {
        await this.referralService.createReferral(referralId, user.id);
      }
    }

    if (!user) {
      throw new NotFoundException();
    }

    return { nonce, user };
  }

  async signInBySocial(
    type: UserSocials,
    profile: UserSocialProfile,
  ): Promise<AuthTokens> {
    let user = await this.usersService
      .findOne({ [type]: profile })
      .catch(() => null);

    if (!user) {
      user = await this.usersService.create({
        [type]: profile,
        displayedName: profile.name,
        email: profile.email,
      });
    }

    return this.authUser(user);
  }

  private async validateMetamaskUser(
    walletAddress: string,
    referralId: number,
  ): Promise<User> {
    try {
      const wallet = await this.usersService.findWallet(
        walletAddress.toLowerCase(),
        true,
      );
      return wallet.user;
    } catch (error) {
      const res = await this.createNonce({ walletAddress, referralId });
      return res.user;
    }
  }

  private async validateSolanaUser(
    account: string,
    signature: number[],
    referralId: number,
  ): Promise<User> {
    try {
      const user = await this.usersService.findBySolanaAccount(account);
      const isVerified = await this.usersService.verifySolanaAccount(
        account,
        signature,
        user,
      );
      if (!isVerified) {
        throw new BadRequestException('Not valid signature');
      }

      await this.createNonce({ solanaAccount: account, referralId });
      return user;
    } catch (error) {
      throw error;
    }
  }

  private static getMessageForSign(nonce: string) {
    return UsersService.getMessageForSign(nonce);
  }
}
