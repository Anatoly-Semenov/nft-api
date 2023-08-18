export function filterArrayByAnotherArray(
  searchArray: string[],
  filterArray: string[],
) {
  searchArray.sort(sortAnyArray);
  filterArray.sort(sortAnyArray);

  const searchArrayLen = searchArray.length,
    filterArrayLen = filterArray.length;

  const progressiveLinearComplexity =
    ((searchArrayLen << 1) + filterArrayLen) >>> 0;
  const binarySearchComplexity =
    (searchArrayLen * (32 - Math.clz32(filterArrayLen - 1))) >>> 0;

  // After computing the complexity, we can predict which algorithm will be the fastest
  let i = 0;
  if (progressiveLinearComplexity < binarySearchComplexity) {
    // Progressive Linear Search
    return fastFilter(searchArray, function (currentValue) {
      while (filterArray[i] < currentValue) i = (i + 1) | 0;
      // +undefined = NaN, which is always false for <, avoiding an infinite loop
      return filterArray[i] !== currentValue;
    });
  } else {
    // Binary Search
    return fastFilter(searchArray, fastestBinarySearch(filterArray));
  }
}

function sortAnyArray(a, b) {
  return a > b ? 1 : a === b ? 0 : -1;
}

function fastFilter(array, handle) {
  // eslint-disable-next-line prefer-const
  let out = [],
    value = 0;
  for (let i = 0, len = array.length | 0; i < len; i = (i + 1) | 0)
    if (handle((value = array[i]))) out.push(value);
  return out;
}

function fastestBinarySearch(array) {
  const initLen = ((array.length | 0) - 1) | 0;

  const compGoto = Math.clz32(initLen) & 31;
  return function (sValue) {
    let len = initLen | 0;
    switch (compGoto) {
      case 0:
        if (len & 0x80000000) {
          const nCB = len & 0x80000000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 1:
        if (len & 0x40000000) {
          const nCB = len & 0xc0000000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 2:
        if (len & 0x20000000) {
          const nCB = len & 0xe0000000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 3:
        if (len & 0x10000000) {
          const nCB = len & 0xf0000000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 4:
        if (len & 0x8000000) {
          const nCB = len & 0xf8000000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 5:
        if (len & 0x4000000) {
          const nCB = len & 0xfc000000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 6:
        if (len & 0x2000000) {
          const nCB = len & 0xfe000000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 7:
        if (len & 0x1000000) {
          const nCB = len & 0xff000000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 8:
        if (len & 0x800000) {
          const nCB = len & 0xff800000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 9:
        if (len & 0x400000) {
          const nCB = len & 0xffc00000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 10:
        if (len & 0x200000) {
          const nCB = len & 0xffe00000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 11:
        if (len & 0x100000) {
          const nCB = len & 0xfff00000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 12:
        if (len & 0x80000) {
          const nCB = len & 0xfff80000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 13:
        if (len & 0x40000) {
          const nCB = len & 0xfffc0000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 14:
        if (len & 0x20000) {
          const nCB = len & 0xfffe0000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 15:
        if (len & 0x10000) {
          const nCB = len & 0xffff0000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 16:
        if (len & 0x8000) {
          const nCB = len & 0xffff8000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 17:
        if (len & 0x4000) {
          const nCB = len & 0xffffc000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 18:
        if (len & 0x2000) {
          const nCB = len & 0xffffe000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 19:
        if (len & 0x1000) {
          const nCB = len & 0xfffff000;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 20:
        if (len & 0x800) {
          const nCB = len & 0xfffff800;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 21:
        if (len & 0x400) {
          const nCB = len & 0xfffffc00;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 22:
        if (len & 0x200) {
          const nCB = len & 0xfffffe00;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 23:
        if (len & 0x100) {
          const nCB = len & 0xffffff00;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 24:
        if (len & 0x80) {
          const nCB = len & 0xffffff80;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 25:
        if (len & 0x40) {
          const nCB = len & 0xffffffc0;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 26:
        if (len & 0x20) {
          const nCB = len & 0xffffffe0;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 27:
        if (len & 0x10) {
          const nCB = len & 0xfffffff0;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 28:
        if (len & 0x8) {
          const nCB = len & 0xfffffff8;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 29:
        if (len & 0x4) {
          const nCB = len & 0xfffffffc;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 30:
        if (len & 0x2) {
          const nCB = len & 0xfffffffe;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
      case 31:
        if (len & 0x1) {
          const nCB = len & 0xffffffff;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          len ^= (len ^ (nCB - 1)) & ((((array[nCB] <= sValue) | 0) - 1) >>> 0);
        }
    }
    // MODIFICATION: Instead of returning the index, this binary search
    //                instead returns whether something was found or not.
    if (array[len | 0] !== sValue) {
      return true; // preserve the value at this index
    } else {
      return false; // eliminate the value at this index
    }
  };
}
