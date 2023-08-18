export namespace Helpers {
  export type GenerateCacheKeyArgs = {
    name: string;
    id?: string | number;
  };

  // name-id || name
  export const generateCacheKey = ({
    name,
    id = '',
  }: GenerateCacheKeyArgs): string => (name + id ? '-' + id : '');

  export const uint256ToNumber = (amount: string): number => {
    if (amount.length > 1) {
      return parseInt(amount) / 10 ** 18;
    }

    return Number(amount);
  };

  export const uint256ToUnsignedNumber = (amount: string): number =>
    Math.sqrt(Math.pow(Helpers.uint256ToNumber(amount), 2));

  export const buildCorrectTwitterChannel = (channel: string): string => {
    const rules = [/[^A-Za-z0-9_]/g];

    return rules.reduce((ret: string, reg) => ret.replace(reg, ''), channel);
  };

  export const arrayToMatrix = <T = any>(array: T[], delimiter = 10): T[][] =>
    array.reduce(
      (rows, key, index) =>
        (index % delimiter === 0
          ? rows.push([key])
          : rows[rows.length - 1].push(key)) && rows,
      [],
    );

  export const resolveObjectKeys = (path: string, data: any) =>
    path?.split('.').reduce((previous, current) => {
      if (previous) {
        if (Array.isArray(previous[current])) {
          if (previous[current].length) {
            return previous[current];
          }

          return null;
        }

        return previous[current];
      }

      return null;
    }, data);
}
