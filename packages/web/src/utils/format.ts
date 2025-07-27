/**
 * 格式化工具函数
 */

// 数字格式化
export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  return new Intl.NumberFormat('zh-CN', options).format(value);
};

export const formatCurrency = (value: number, currency = 'CNY'): string => {
  return formatNumber(value, {
    style: 'currency',
    currency,
  });
};

export const formatPercent = (value: number, decimals = 1): string => {
  return formatNumber(value / 100, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  
  return `${seconds}s`;
};

// 日期格式化
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  }).format(d);
};

export const formatDateTime = (date: Date | string | number): string => {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatTime = (date: Date | string | number): string => {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatRelativeTime = (date: Date | string | number): string => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  
  const rtf = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' });
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return rtf.format(-diffDays, 'day');
  }
  
  if (diffHours > 0) {
    return rtf.format(-diffHours, 'hour');
  }
  
  if (diffMinutes > 0) {
    return rtf.format(-diffMinutes, 'minute');
  }
  
  return rtf.format(-diffSeconds, 'second');
};

// 字符串格式化
export const formatCamelCase = (str: string): string => {
  return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
};

export const formatPascalCase = (str: string): string => {
  const camelCase = formatCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

export const formatKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

export const formatSnakeCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s\-]+/g, '_')
    .toLowerCase();
};

export const formatTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const formatTruncate = (str: string, length: number, suffix = '...'): string => {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

export const formatPlural = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
};

// HTML/文本格式化
export const formatStripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

export const formatEscapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

export const formatUnescapeHtml = (html: string): string => {
  const map: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  
  return html.replace(/&(amp|lt|gt|quot|#39);/g, (entity) => map[entity]);
};

// JSON 格式化
export const formatJsonPretty = (obj: any, indent = 2): string => {
  try {
    return JSON.stringify(obj, null, indent);
  } catch (error) {
    return String(obj);
  }
};

export const formatJsonMinify = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    return String(obj);
  }
};

// URL 格式化
export const formatUrl = (url: string, params?: Record<string, any>): string => {
  if (!params) return url;
  
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlObj.searchParams.set(key, String(value));
    }
  });
  
  return urlObj.toString();
};

export const formatQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.set(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

// 测试相关格式化
export const formatTestResult = (passed: number, total: number): string => {
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
  return `${passed}/${total} (${percentage}%)`;
};

export const formatTestStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    pending: '待执行',
    running: '执行中',
    passed: '通过',
    failed: '失败',
    skipped: '跳过',
    cancelled: '已取消',
  };
  
  return statusMap[status] || status;
};

export const formatTestType = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    functional: '功能测试',
    ux: '用户体验',
    performance: '性能测试',
    accessibility: '可访问性',
    security: '安全测试',
    regression: '回归测试',
  };
  
  return typeMap[type] || type;
};

export const formatTestPriority = (priority: string): string => {
  const priorityMap: { [key: string]: string } = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急',
  };
  
  return priorityMap[priority] || priority;
};