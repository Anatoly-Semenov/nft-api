export class ItemsListResponseDto<ItemType> {
  items: ItemType[];
  count: number;

  constructor(partial?: Partial<ItemsListResponseDto<ItemType>>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
