/**
 * 字符串工具函数
 */

export const string = {
  // 驼峰转换
  toCamelCase: (str: string): string => {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
  },
  
  // 蛇形转换
  toSnakeCase: (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
  },
  
  // 短横线转换
  toKebabCase: (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/^-/, '');
  },
  
  // 首字母大写
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  // 截断文本
  truncate: (str: string, length: number, suffix: string = '...'): string => {
    if (str.length <= length) return str;
    return str.slice(0, length - suffix.length) + suffix;
  },
  
  // 移除 HTML 标签
  stripHtml: (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },
  
  // 转义 HTML
  escapeHtml: (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  },
  
  // 生成随机字符串
  random: (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // 词频统计
  wordCount: (text: string): number => {
    return text.trim().split(/\s+/).length;
  },
  
  // 检查是否为空
  isEmpty: (str: string | null | undefined): boolean => {
    return !str || str.trim().length === 0;
  },
};