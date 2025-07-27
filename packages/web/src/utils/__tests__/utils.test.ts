/**
 * 工具函数测试
 */

import {
  isString,
  isNumber,
  isEmail,
  isUrl,
  validateSchema,
  required,
  minLength,
  email,
  url,
} from '@/utils/validation';

import {
  formatNumber,
  formatFileSize,
  formatDuration,
  formatDate,
  formatCamelCase,
  formatTruncate,
} from '@/utils/format';

import {
  sleep,
  retry,
  debounce,
  throttle,
  clamp,
  range,
} from '@/utils';

describe('Validation Utils', () => {
  describe('Type Checks', () => {
    it('should validate strings correctly', () => {
      expect(isString('hello')).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
    });

    it('should validate numbers correctly', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-123)).toBe(true);
      expect(isNumber(123.45)).toBe(true);
      expect(isNumber('123')).toBe(false);
      expect(isNumber(NaN)).toBe(false);
    });

    it('should validate emails correctly', () => {
      expect(isEmail('test@example.com')).toBe(true);
      expect(isEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isEmail('invalid-email')).toBe(false);
      expect(isEmail('missing@domain')).toBe(false);
      expect(isEmail('@domain.com')).toBe(false);
    });

    it('should validate URLs correctly', () => {
      expect(isUrl('https://example.com')).toBe(true);
      expect(isUrl('http://localhost:3000')).toBe(true);
      expect(isUrl('ftp://files.example.com')).toBe(false);
      expect(isUrl('not-a-url')).toBe(false);
      expect(isUrl('www.example.com')).toBe(false);
    });
  });

  describe('Schema Validation', () => {
    it('should validate object with schema', () => {
      const schema = {
        name: [required(), minLength(2)],
        email: [required(), email()],
        website: [url()],
      };

      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        website: 'https://johndoe.com',
      };

      const result = validateSchema(validData, schema);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return validation errors', () => {
      const schema = {
        name: [required(), minLength(3)],
        email: [required(), email()],
      };

      const invalidData = {
        name: 'Jo',
        email: 'invalid-email',
      };

      const result = validateSchema(invalidData, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toContain('最少需要 3 个字符');
      expect(result.errors.email).toContain('请输入有效的邮箱地址');
    });
  });
});

describe('Format Utils', () => {
  it('should format numbers correctly', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('should format file sizes correctly', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('should format duration correctly', () => {
    expect(formatDuration(500)).toBe('500ms');
    expect(formatDuration(1500)).toBe('1s');
    expect(formatDuration(65000)).toBe('1m 5s');
    expect(formatDuration(3665000)).toBe('1h 1m 5s');
  });

  it('should format strings correctly', () => {
    expect(formatCamelCase('hello world')).toBe('helloWorld');
    expect(formatCamelCase('test-string_here')).toBe('testStringHere');
    
    expect(formatTruncate('This is a long string', 10)).toBe('This is...');
    expect(formatTruncate('Short', 10)).toBe('Short');
  });
});

describe('General Utils', () => {
  it('should sleep for specified time', async () => {
    const start = Date.now();
    await sleep(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(90);
    expect(elapsed).toBeLessThan(150);
  });

  it('should retry failed operations', async () => {
    let attempts = 0;
    const failingFunction = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Failed');
      }
      return 'success';
    };

    const result = await retry(failingFunction, 3, 10);
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should clamp values to range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should generate number ranges', () => {
    expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(range(1, 4)).toEqual([1, 2, 3]);
    expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
  });

  it('should debounce function calls', (done) => {
    let callCount = 0;
    const debouncedFn = debounce(() => {
      callCount++;
    }, 50);

    // 调用多次
    debouncedFn();
    debouncedFn();
    debouncedFn();

    // 立即检查，应该还没有执行
    expect(callCount).toBe(0);

    // 等待 debounce 延迟后检查
    setTimeout(() => {
      expect(callCount).toBe(1);
      done();
    }, 60);
  });

  it('should throttle function calls', (done) => {
    let callCount = 0;
    const throttledFn = throttle(() => {
      callCount++;
    }, 50);

    // 快速调用多次
    throttledFn();
    setTimeout(() => throttledFn(), 10);
    setTimeout(() => throttledFn(), 20);
    setTimeout(() => throttledFn(), 30);

    // 第一次调用应该立即执行
    expect(callCount).toBe(1);

    // 等待 throttle 周期结束
    setTimeout(() => {
      // 在 throttle 期间应该只执行一次
      expect(callCount).toBe(1);
      
      // 再次调用应该能执行
      throttledFn();
      expect(callCount).toBe(2);
      done();
    }, 60);
  });
});