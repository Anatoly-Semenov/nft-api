export * from './social';

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type RegularManagerOptions = Partial<{
  relations: string[];
  take: number;
  skip: number;
}>;
