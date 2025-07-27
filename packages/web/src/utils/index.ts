/**
 * 统一工具函数库入口
 * 集中管理所有工具函数
 */

// 重新导出所有工具模块
// 重新导出验证函数 (排除 url 函数以避免冲突)
export {
  isString, isNumber, isBoolean, isObject, isArray, isFunction, isDefined, isEmpty,
  isUrl, isEmail, isPhone, isStrongPassword, isCssSelector, isXPath,
  isPositive, isNonNegative, isInRange, isInteger,
  hasMinLength, hasMaxLength, isLengthInRange, containsOnly,
  hasMinItems, hasMaxItems, hasUniqueItems,
  hasRequiredKeys, hasOnlyAllowedKeys,
  validateSchema, required, minLength, maxLength, pattern, email, min, max,
  isValidTestType, isValidTestPriority, isValidTestStatus,
  type ValidationRule, type ValidationSchema, type ValidationResult
} from './validation';

// 导出验证 url 函数，使用别名避免冲突
export { url as urlValidator } from './validation';

export * from './format';
export * from './dom';
export * from './async';
export * from './storage';
export * from './file';
export * from './url';
export * from './date';
export * from './string';
export * from './array';
export * from './object';
export * from './logger';

// 通用工具函数
export const noop = () => {};

export const identity = <T>(value: T): T => value;

export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const randomId = (): string => 
  Math.random().toString(36).substring(2) + Date.now().toString(36);

export const uuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const clamp = (value: number, min: number, max: number): number => 
  Math.min(Math.max(value, min), max);

export const lerp = (start: number, end: number, factor: number): number => 
  start + (end - start) * factor;

export const range = (start: number, end: number, step = 1): number[] => {
  const result = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
};

export const retry = async <T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < attempts - 1) {
        await sleep(delay * (i + 1));
      }
    }
  }
  
  throw lastError!;
};

export const throttle = <T extends any[]>(
  fn: (...args: T) => void,
  delay: number
): (...args: T) => void => {
  let lastCall = 0;
  
  return (...args: T) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
};

export const debounce = <T extends any[]>(
  fn: (...args: T) => void,
  delay: number
): (...args: T) => void => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const memoize = <T extends any[], R>(
  fn: (...args: T) => R,
  getKey?: (...args: T) => string
): (...args: T) => R => {
  const cache = new Map<string, R>();
  
  return (...args: T) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};