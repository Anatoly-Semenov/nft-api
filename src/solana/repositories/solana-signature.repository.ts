import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SolanaSignature } from '../entities/solana-signature.entity';
import { Between, getConnection, In, MoreThan, Repository } from 'typeorm';
import { SolanaSignatureStateEnum } from '../enums/solana-signature-state.enum';

export const SOLANA_SIGNATURE_REPOSITORY_SERVICE_NAME =
  'SOLANA_SIGNATURE_REPOSITORY';

@Injectable()
export class SolanaSignatureRepository {
  constructor(
    @InjectRepository(SolanaSignature)
    private readonly signatureRepository: Repository<SolanaSignature>,
  ) {}

  countByAssociatedTokenAccount(
    associatedTokenAccountId: number,
  ): Promise<number> {
    return this.signatureRepository.count({
      where: {
        solana_associated_token_account_id: associatedTokenAccountId,
      },
    });
  }

  countByAccount(accountId: number): Promise<number> {
    return this.signatureRepository.count({
      where: {
        account_id: accountId,
      },
    });
  }

  multipleInsert(values: SolanaSignature[]) {
    return getConnection()
      .createQueryBuilder()
      .insert()
      .into(SolanaSignature)
      .values(values)
      .execute();
  }

  getSomeSignatureWithStateLastByAssociatedTokenAccountId(
    associatedTokenAccountId: number,
  ): Promise<SolanaSignature | undefined> {
    return this.signatureRepository.findOne({
      solana_associated_token_account_id: associatedTokenAccountId,
      state: In([
        SolanaSignatureStateEnum.NEW_LAST_SIGNATURE,
        SolanaSignatureStateEnum.IN_PROGRESS_LAST_SIGNATURE,
        SolanaSignatureStateEnum.PROCESSED_LAST_SIGNATURE,
      ]),
    });
  }

  getSomeSignatureWithStateLastByAccountId(
    accountId: number,
  ): Promise<SolanaSignature | undefined> {
    return this.signatureRepository.findOne({
      account_id: accountId,
      state: In([
        SolanaSignatureStateEnum.NEW_LAST_SIGNATURE,
        SolanaSignatureStateEnum.IN_PROGRESS_LAST_SIGNATURE,
        SolanaSignatureStateEnum.PROCESSED_LAST_SIGNATURE,
      ]),
    });
  }

  getSomeSignatureWithStateFirstByAssociatedTokenAccountId(
    associatedTokenAccountId: number,
  ): Promise<SolanaSignature | undefined> {
    return this.signatureRepository.findOne({
      solana_associated_token_account_id: associatedTokenAccountId,
      state: In([
        SolanaSignatureStateEnum.NEW_FIRST_SIGNATURE,
        SolanaSignatureStateEnum.IN_PROGRESS_FIRST_SIGNATURE,
        SolanaSignatureStateEnum.PROCESSED_FIRST_SIGNATURE,
      ]),
    });
  }

  getSomeSignatureWithStateFirstByAccountId(
    accountId: number,
  ): Promise<SolanaSignature | undefined> {
    return this.signatureRepository.findOne({
      account_id: accountId,
      state: In([
        SolanaSignatureStateEnum.NEW_FIRST_SIGNATURE,
        SolanaSignatureStateEnum.IN_PROGRESS_FIRST_SIGNATURE,
        SolanaSignatureStateEnum.PROCESSED_FIRST_SIGNATURE,
      ]),
    });
  }

  getLastSignatureByAssociatedTokenAccountId(
    associatedTokenAccountId: number,
  ): Promise<SolanaSignature | undefined> {
    return this.signatureRepository.findOne({
      where: {
        solana_associated_token_account_id: associatedTokenAccountId,
      },
      order: { block_time: 'ASC', id: 'DESC' },
    });
  }

  getLastSignatureByAccountId(
    accountId: number,
  ): Promise<SolanaSignature | undefined> {
    return this.signatureRepository.findOne({
      where: {
        account_id: accountId,
      },
      order: { block_time: 'ASC', id: 'DESC' },
    });
  }

  getFirstSignatureByAssociatedTokenAccountId(
    associatedTokenAccountId: number,
  ): Promise<SolanaSignature | undefined> {
    return this.signatureRepository.findOne({
      where: {
        solana_associated_token_account_id: associatedTokenAccountId,
      },
      order: { block_time: 'DESC', id: 'ASC' },
    });
  }

  getFirstSignatureByAccountId(
    accountId: number,
  ): Promise<SolanaSignature | undefined> {
    return this.signatureRepository.findOne({
      where: {
        account_id: accountId,
      },
      order: { block_time: 'DESC', id: 'ASC' },
    });
  }

  getLastSignatureUntilCurrentSignature(
    currentSignature: SolanaSignature,
  ): Promise<SolanaSignature | undefined> {
    return this.signatureRepository.findOne({
      where: {
        solana_associated_token_account_id:
          currentSignature.solana_associated_token_account_id,
        account_id: currentSignature.account_id,
        block_time: MoreThan(currentSignature.block_time),
      },
      order: { block_time: 'ASC', id: 'DESC' },
    });
  }

  save(entity: SolanaSignature) {
    return this.signatureRepository.save(entity);
  }

  async setNewFirstSignature(
    oldFirstSignatureEntity: SolanaSignature,
    newFirstSignatureEntity: SolanaSignature,
  ) {
    if (
      oldFirstSignatureEntity.state ===
      SolanaSignatureStateEnum.NEW_FIRST_SIGNATURE
    ) {
      oldFirstSignatureEntity.state = SolanaSignatureStateEnum.NEW;
    } else if (
      oldFirstSignatureEntity.state ===
      SolanaSignatureStateEnum.IN_PROGRESS_FIRST_SIGNATURE
    ) {
      oldFirstSignatureEntity.state = SolanaSignatureStateEnum.IN_PROGRESS;
    } else if (
      oldFirstSignatureEntity.state ===
      SolanaSignatureStateEnum.PROCESSED_FIRST_SIGNATURE
    ) {
      oldFirstSignatureEntity.state = SolanaSignatureStateEnum.PROCESSED;
    }

    await this.signatureRepository.manager.transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        await transactionalEntityManager.save(oldFirstSignatureEntity);

        newFirstSignatureEntity.state =
          SolanaSignatureStateEnum.NEW_FIRST_SIGNATURE;
        await transactionalEntityManager.save(newFirstSignatureEntity);
      },
    );
  }

  findNewSignatureListInRange(
    associatedTokenAccountId: number,
    maxBlockTime: number,
    minBlockTime: number,
    take: number,
  ): Promise<SolanaSignature[]> {
    return this.signatureRepository.find({
      where: {
        solana_associated_token_account_id: associatedTokenAccountId,
        block_time: Between(minBlockTime, maxBlockTime),
        state: In([
          SolanaSignatureStateEnum.NEW_FIRST_SIGNATURE,
          SolanaSignatureStateEnum.NEW,
          SolanaSignatureStateEnum.NEW_LAST_SIGNATURE,
        ]),
      },
      take,
    });
  }

  findInProgressSignatureListByAssociatedTokenAccountList(
    associatedTokenAccountIds: number[],
  ): Promise<SolanaSignature[]> {
    return this.signatureRepository.find({
      where: {
        solana_associated_token_account_id: In(associatedTokenAccountIds),
        state: In([
          SolanaSignatureStateEnum.IN_PROGRESS_FIRST_SIGNATURE,
          SolanaSignatureStateEnum.IN_PROGRESS,
          SolanaSignatureStateEnum.IN_PROGRESS_LAST_SIGNATURE,
        ]),
      },
    });
  }

  findInProgressSignatureListByAccountList(
    accountIds: number[],
  ): Promise<SolanaSignature[]> {
    return this.signatureRepository.find({
      where: {
        account_id: In(accountIds),
        state: In([
          SolanaSignatureStateEnum.IN_PROGRESS_FIRST_SIGNATURE,
          SolanaSignatureStateEnum.IN_PROGRESS,
          SolanaSignatureStateEnum.IN_PROGRESS_LAST_SIGNATURE,
        ]),
      },
    });
  }

  findNewSignatureListInRangeForAccountId(
    accountId: number,
    maxBlockTime: number,
    minBlockTime: number,
    take: number,
  ): Promise<SolanaSignature[]> {
    return this.signatureRepository.find({
      where: {
        account_id: accountId,
        block_time: Between(minBlockTime, maxBlockTime),
        state: In([
          SolanaSignatureStateEnum.NEW_FIRST_SIGNATURE,
          SolanaSignatureStateEnum.NEW,
          SolanaSignatureStateEnum.NEW_LAST_SIGNATURE,
        ]),
      },
      take,
    });
  }

  findByIds(ids: number[]): Promise<SolanaSignature[]> {
    return this.signatureRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  async changeStateFromNewToInProgress(
    entityList: SolanaSignature[],
  ): Promise<SolanaSignature[]> {
    const firstSignatureIds = entityList
      .filter((e) => e.state === SolanaSignatureStateEnum.NEW_FIRST_SIGNATURE)
      .map((e) => e.id);

    const lastSignatureIds = entityList
      .filter((e) => e.state === SolanaSignatureStateEnum.NEW_LAST_SIGNATURE)
      .map((e) => e.id);

    const otherSignatureIds = entityList
      .filter((e) => e.state === SolanaSignatureStateEnum.NEW)
      .map((e) => e.id);

    await SolanaSignatureRepository.updateStates(
      {
        ids: firstSignatureIds,
        state: SolanaSignatureStateEnum.IN_PROGRESS_FIRST_SIGNATURE,
      },
      {
        ids: lastSignatureIds,
        state: SolanaSignatureStateEnum.IN_PROGRESS_LAST_SIGNATURE,
      },
      { ids: otherSignatureIds, state: SolanaSignatureStateEnum.IN_PROGRESS },
    );

    return this.findByIds([
      ...firstSignatureIds,
      ...otherSignatureIds,
      ...lastSignatureIds,
    ]);
  }

  async changeStateFromInProgressToProcessed(
    entityList: SolanaSignature[],
  ): Promise<SolanaSignature[]> {
    const firstSignatureIds = entityList
      .filter(
        (e) => e.state === SolanaSignatureStateEnum.IN_PROGRESS_FIRST_SIGNATURE,
      )
      .map((e) => e.id);

    const lastSignatureIds = entityList
      .filter(
        (e) => e.state === SolanaSignatureStateEnum.IN_PROGRESS_LAST_SIGNATURE,
      )
      .map((e) => e.id);

    const otherSignatureIds = entityList
      .filter((e) => e.state === SolanaSignatureStateEnum.IN_PROGRESS)
      .map((e) => e.id);

    await SolanaSignatureRepository.updateStates(
      {
        ids: firstSignatureIds,
        state: SolanaSignatureStateEnum.PROCESSED_FIRST_SIGNATURE,
      },
      {
        ids: lastSignatureIds,
        state: SolanaSignatureStateEnum.PROCESSED_LAST_SIGNATURE,
      },
      { ids: otherSignatureIds, state: SolanaSignatureStateEnum.PROCESSED },
    );

    return this.findByIds([
      ...firstSignatureIds,
      ...otherSignatureIds,
      ...lastSignatureIds,
    ]);
  }

  changeStateToNew(entityList: SolanaSignature[]) {
    for (const signature of entityList) {
      if (
        signature.state ===
          SolanaSignatureStateEnum.IN_PROGRESS_FIRST_SIGNATURE ||
        signature.state === SolanaSignatureStateEnum.PROCESSED_FIRST_SIGNATURE
      ) {
        signature.state = SolanaSignatureStateEnum.NEW_FIRST_SIGNATURE;
      }

      if (
        signature.state ===
          SolanaSignatureStateEnum.IN_PROGRESS_LAST_SIGNATURE ||
        signature.state === SolanaSignatureStateEnum.PROCESSED_LAST_SIGNATURE
      ) {
        signature.state = SolanaSignatureStateEnum.NEW_LAST_SIGNATURE;
      }

      if (
        signature.state === SolanaSignatureStateEnum.IN_PROGRESS ||
        signature.state === SolanaSignatureStateEnum.PROCESSED
      ) {
        signature.state = SolanaSignatureStateEnum.NEW;
      }
    }

    return this.signatureRepository.save(entityList);
  }

  async findBySignature(
    signature: string,
    associatedAccountIds: number[],
    accountIds: number[],
  ): Promise<SolanaSignature[]> {
    const conditions = [];
    if (associatedAccountIds.length) {
      conditions.push({
        signature: signature,
        solana_associated_token_account_id: In(associatedAccountIds),
      });
    }

    if (accountIds.length) {
      conditions.push({
        signature: signature,
        account_id: In(accountIds),
      });
    }

    if (!conditions.length) {
      return [];
    }

    return await this.signatureRepository.find({
      where: conditions,
    });
  }

  async findDuplicateFor(
    signatureList: SolanaSignature[],
  ): Promise<SolanaSignature[]> {
    const conditions = signatureList.map((s) => ({
      signature: s.signature,
      slot: s.slot,
      solana_associated_token_account_id: s.solana_associated_token_account_id,
      account_id: s.account_id,
    }));

    if (conditions.length) {
      return await this.signatureRepository.find({
        where: conditions,
      });
    }

    return [];
  }

  private static async updateStates(
    firstSignature: {
      ids: number[];
      state: SolanaSignatureStateEnum;
    },
    lastSignature: {
      ids: number[];
      state: SolanaSignatureStateEnum;
    },
    otherSignature: {
      ids: number[];
      state: SolanaSignatureStateEnum;
    },
  ) {
    if (firstSignature.ids.length) {
      await SolanaSignatureRepository.changeStateByIds(
        firstSignature.ids,
        firstSignature.state,
      );
    }

    if (lastSignature.ids.length) {
      await SolanaSignatureRepository.changeStateByIds(
        lastSignature.ids,
        lastSignature.state,
      );
    }

    if (otherSignature.ids.length) {
      await SolanaSignatureRepository.changeStateByIds(
        otherSignature.ids,
        otherSignature.state,
      );
    }
  }

  private static async changeStateByIds(
    ids: number[],
    state: SolanaSignatureStateEnum,
  ) {
    return await getConnection()
      .createQueryBuilder()
      .update(SolanaSignature)
      .set({ state })
      .where({ id: In(ids) })
      .execute();
  }
}
