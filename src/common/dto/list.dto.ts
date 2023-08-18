import { MetaListDto } from './meta-list.dto';

export class ListDto<T> {
  data: T[];
  meta: MetaListDto;

  constructor(partial?: Partial<ListDto<T>>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
