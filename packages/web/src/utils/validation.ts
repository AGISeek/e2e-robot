/**
 * 验证工具函数
 */

import { REGEX_PATTERNS } from '@/constants';

// 基础验证函数
export const isString = (value: any): value is string => 
  typeof value === 'string';

export const isNumber = (value: any): value is number => 
  typeof value === 'number' && !isNaN(value);

export const isBoolean = (value: any): value is boolean => 
  typeof value === 'boolean';

export const isObject = (value: any): value is object => 
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const isArray = (value: any): value is any[] => 
  Array.isArray(value);

export const isFunction = (value: any): value is Function => 
  typeof value === 'function';

export const isDefined = <T>(value: T | undefined | null): value is T => 
  value !== undefined && value !== null;

export const isEmpty = (value: any): boolean => {
  if (!isDefined(value)) return true;
  if (isString(value)) return value.trim().length === 0;
  if (isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
};

// 特定类型验证
export const isUrl = (value: string): boolean => 
  REGEX_PATTERNS.URL.test(value);

export const isEmail = (value: string): boolean => 
  REGEX_PATTERNS.EMAIL.test(value);

export const isPhone = (value: string): boolean => 
  REGEX_PATTERNS.PHONE.test(value);

export const isStrongPassword = (value: string): boolean => 
  REGEX_PATTERNS.PASSWORD.test(value);

export const isCssSelector = (value: string): boolean => 
  REGEX_PATTERNS.CSS_SELECTOR.test(value);

export const isXPath = (value: string): boolean => 
  REGEX_PATTERNS.XPATH.test(value);

// 数值验证
export const isPositive = (value: number): boolean => 
  isNumber(value) && value > 0;

export const isNonNegative = (value: number): boolean => 
  isNumber(value) && value >= 0;

export const isInRange = (value: number, min: number, max: number): boolean => 
  isNumber(value) && value >= min && value <= max;

export const isInteger = (value: number): boolean => 
  isNumber(value) && Number.isInteger(value);

// 字符串验证
export const hasMinLength = (value: string, minLength: number): boolean => 
  isString(value) && value.length >= minLength;

export const hasMaxLength = (value: string, maxLength: number): boolean => 
  isString(value) && value.length <= maxLength;

export const isLengthInRange = (value: string, min: number, max: number): boolean => 
  isString(value) && value.length >= min && value.length <= max;

export const containsOnly = (value: string, pattern: RegExp): boolean => 
  isString(value) && pattern.test(value);

// 数组验证
export const hasMinItems = (arr: any[], minItems: number): boolean => 
  isArray(arr) && arr.length >= minItems;

export const hasMaxItems = (arr: any[], maxItems: number): boolean => 
  isArray(arr) && arr.length <= maxItems;

export const hasUniqueItems = (arr: any[]): boolean => {
  if (!isArray(arr)) return false;
  const seen = new Set();
  return arr.every(item => {
    const key = typeof item === 'object' ? JSON.stringify(item) : item;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// 对象验证
export const hasRequiredKeys = (obj: object, keys: string[]): boolean => {
  if (!isObject(obj)) return false;
  return keys.every(key => key in obj);
};

export const hasOnlyAllowedKeys = (obj: object, allowedKeys: string[]): boolean => {
  if (!isObject(obj)) return false;
  const objKeys = Object.keys(obj);
  return objKeys.every(key => allowedKeys.includes(key));
};

// 复合验证函数
export interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string[] };
}

export const validateSchema = (data: any, schema: ValidationSchema): ValidationResult => {
  const errors: { [key: string]: string[] } = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const fieldErrors: string[] = [];
    
    for (const rule of rules) {
      if (!rule.validator(value)) {
        fieldErrors.push(rule.message);
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// 常用验证规则构建器
export const required = (message = '此字段为必填项'): ValidationRule => ({
  validator: (value) => !isEmpty(value),
  message,
});

export const minLength = (min: number, message?: string): ValidationRule => ({
  validator: (value) => hasMinLength(value, min),
  message: message || `最少需要 ${min} 个字符`,
});

export const maxLength = (max: number, message?: string): ValidationRule => ({
  validator: (value) => hasMaxLength(value, max),
  message: message || `最多允许 ${max} 个字符`,
});

export const pattern = (regex: RegExp, message: string): ValidationRule => ({
  validator: (value) => !isDefined(value) || regex.test(value),
  message,
});

export const url = (message = '请输入有效的URL'): ValidationRule => ({
  validator: (value) => !isDefined(value) || isUrl(value),
  message,
});

export const email = (message = '请输入有效的邮箱地址'): ValidationRule => ({
  validator: (value) => !isDefined(value) || isEmail(value),
  message,
});

export const min = (minValue: number, message?: string): ValidationRule => ({
  validator: (value) => !isDefined(value) || (isNumber(value) && value >= minValue),
  message: message || `最小值为 ${minValue}`,
});

export const max = (maxValue: number, message?: string): ValidationRule => ({
  validator: (value) => !isDefined(value) || (isNumber(value) && value <= maxValue),
  message: message || `最大值为 ${maxValue}`,
});

// 测试相关验证
export const isValidTestType = (value: string): boolean => {
  const validTypes = ['functional', 'ux', 'performance', 'accessibility', 'security', 'regression'];
  return validTypes.includes(value);
};

export const isValidTestPriority = (value: string): boolean => {
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  return validPriorities.includes(value);
};

export const isValidTestStatus = (value: string): boolean => {
  const validStatuses = ['pending', 'running', 'passed', 'failed', 'skipped', 'cancelled'];
  return validStatuses.includes(value);
};