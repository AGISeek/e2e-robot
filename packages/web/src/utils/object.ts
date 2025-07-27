/**
 * 对象工具函数
 */

export const object = {
  // 深拷贝
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => object.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const copy = {} as T;
      Object.keys(obj).forEach(key => {
        (copy as any)[key] = object.deepClone((obj as any)[key]);
      });
      return copy;
    }
    return obj;
  },
  
  // 深度合并
  deepMerge: <T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T => {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (object.isObject(target) && object.isObject(source)) {
      for (const key in source) {
        if (object.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          object.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
    
    return object.deepMerge(target, ...sources);
  },
  
  // 判断是否为对象
  isObject: (item: any): boolean => {
    return item && typeof item === 'object' && !Array.isArray(item);
  },
  
  // 获取嵌套值
  get: (obj: any, path: string, defaultValue?: any): any => {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  },
  
  // 设置嵌套值
  set: (obj: any, path: string, value: any): void => {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  },
  
  // 删除嵌套值
  unset: (obj: any, path: string): boolean => {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        return false;
      }
      current = current[key];
    }
    
    const lastKey = keys[keys.length - 1];
    if (lastKey in current) {
      delete current[lastKey];
      return true;
    }
    
    return false;
  },
  
  // 过滤对象
  filter: <T extends Record<string, any>>(
    obj: T, 
    predicate: (value: any, key: string) => boolean
  ): Partial<T> => {
    const result: Partial<T> = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (predicate(value, key)) {
        (result as any)[key] = value;
      }
    });
    return result;
  },
  
  // 映射对象值
  mapValues: <T extends Record<string, any>, R>(
    obj: T, 
    mapper: (value: any, key: string) => R
  ): Record<keyof T, R> => {
    const result = {} as Record<keyof T, R>;
    Object.entries(obj).forEach(([key, value]) => {
      result[key as keyof T] = mapper(value, key);
    });
    return result;
  },
  
  // 获取所有路径
  paths: (obj: any, prefix: string = ''): string[] => {
    const result: string[] = [];
    
    Object.keys(obj).forEach(key => {
      const path = prefix ? `${prefix}.${key}` : key;
      result.push(path);
      
      if (object.isObject(obj[key])) {
        result.push(...object.paths(obj[key], path));
      }
    });
    
    return result;
  },
};