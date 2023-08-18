import { getConnection, Repository } from 'typeorm';

export class BaseRepository<T> extends Repository<T> {
  protected entityTarget;

  multipleInsert(values: T[]) {
    return getConnection()
      .createQueryBuilder()
      .insert()
      .into(this.entityTarget)
      .values(values)
      .execute();
  }
}
