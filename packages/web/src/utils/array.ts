/**
 * 数组工具函数
 */

export const array = {
  // 数组去重
  unique: <T>(arr: T[]): T[] => {
    return Array.from(new Set(arr));
  },
  
  // 按对象属性去重
  uniqueBy: <T>(arr: T[], key: keyof T): T[] => {
    const seen = new Set();
    return arr.filter(item => {
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  },
  
  // 分组
  groupBy: <T>(arr: T[], key: keyof T): Record<string, T[]> => {
    return arr.reduce((groups, item) => {
      const val = String(item[key]);
      if (!groups[val]) groups[val] = [];
      groups[val].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },
  
  // 分块
  chunk: <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },
  
  // 打乱数组
  shuffle: <T>(arr: T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },
  
  // 随机选择
  sample: <T>(arr: T[], count: number = 1): T[] => {
    const shuffled = array.shuffle(arr);
    return shuffled.slice(0, count);
  },
  
  // 数组求和
  sum: (arr: number[]): number => {
    return arr.reduce((sum, num) => sum + num, 0);
  },
  
  // 数组平均值
  average: (arr: number[]): number => {
    return arr.length > 0 ? array.sum(arr) / arr.length : 0;
  },
  
  // 最大值
  max: (arr: number[]): number => {
    return Math.max(...arr);
  },
  
  // 最小值
  min: (arr: number[]): number => {
    return Math.min(...arr);
  },
  
  // 数组差集
  difference: <T>(arr1: T[], arr2: T[]): T[] => {
    return arr1.filter(x => !arr2.includes(x));
  },
  
  // 数组交集
  intersection: <T>(arr1: T[], arr2: T[]): T[] => {
    return arr1.filter(x => arr2.includes(x));
  },
};