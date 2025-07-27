/**
 * 日期工具函数
 */

export const date = {
  // 格式化日期
  format: (date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },
  
  // 相对时间
  relative: (date: Date | string | number): string => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return '刚刚';
    if (diffMin < 60) return `${diffMin}分钟前`;
    if (diffHour < 24) return `${diffHour}小时前`;
    if (diffDay < 7) return `${diffDay}天前`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}周前`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)}个月前`;
    return `${Math.floor(diffDay / 365)}年前`;
  },
  
  // 添加时间
  add: (date: Date, amount: number, unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'): Date => {
    const result = new Date(date);
    switch (unit) {
      case 'year':
        result.setFullYear(result.getFullYear() + amount);
        break;
      case 'month':
        result.setMonth(result.getMonth() + amount);
        break;
      case 'day':
        result.setDate(result.getDate() + amount);
        break;
      case 'hour':
        result.setHours(result.getHours() + amount);
        break;
      case 'minute':
        result.setMinutes(result.getMinutes() + amount);
        break;
      case 'second':
        result.setSeconds(result.getSeconds() + amount);
        break;
    }
    return result;
  },
  
  // 获取开始/结束时间
  startOf: (date: Date, unit: 'year' | 'month' | 'day' | 'hour' | 'minute'): Date => {
    const result = new Date(date);
    switch (unit) {
      case 'year':
        result.setMonth(0, 1);
        result.setHours(0, 0, 0, 0);
        break;
      case 'month':
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        break;
      case 'day':
        result.setHours(0, 0, 0, 0);
        break;
      case 'hour':
        result.setMinutes(0, 0, 0);
        break;
      case 'minute':
        result.setSeconds(0, 0);
        break;
    }
    return result;
  },
  
  // 判断是否为同一天
  isSameDay: (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString();
  },
};