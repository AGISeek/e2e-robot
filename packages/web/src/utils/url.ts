/**
 * URL 工具函数
 */

export const url = {
  // 构建查询字符串
  buildQuery: (params: Record<string, any>): string => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query.append(key, String(value));
      }
    });
    return query.toString();
  },
  
  // 解析查询字符串
  parseQuery: (queryString: string): Record<string, string> => {
    const params: Record<string, string> = {};
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  },
  
  // 构建完整 URL
  build: (base: string, path?: string, params?: Record<string, any>): string => {
    let urlString = base;
    if (path) {
      urlString = urlString.endsWith('/') ? urlString + path.replace(/^\//, '') : urlString + '/' + path.replace(/^\//, '');
    }
    if (params) {
      const query = url.buildQuery(params);
      if (query) {
        urlString += (urlString.includes('?') ? '&' : '?') + query;
      }
    }
    return urlString;
  },
  
  // 验证 URL
  isValid: (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  },
  
  // 获取域名
  getDomain: (urlString: string): string | null => {
    try {
      const url = new URL(urlString);
      return url.hostname;
    } catch {
      return null;
    }
  },
  
  // 获取路径
  getPath: (urlString: string): string | null => {
    try {
      const url = new URL(urlString);
      return url.pathname;
    } catch {
      return null;
    }
  },
};