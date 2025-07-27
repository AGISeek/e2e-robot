/**
 * 存储工具函数
 */

export const storage = {
  // localStorage 工具
  local: {
    set: (key: string, value: any): void => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    },
    
    get: <T>(key: string, defaultValue?: T): T | null => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue || null;
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
        return defaultValue || null;
      }
    },
    
    remove: (key: string): void => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
      }
    },
    
    clear: (): void => {
      try {
        localStorage.clear();
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    },
  },
  
  // sessionStorage 工具
  session: {
    set: (key: string, value: any): void => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to save to sessionStorage:', error);
      }
    },
    
    get: <T>(key: string, defaultValue?: T): T | null => {
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue || null;
      } catch (error) {
        console.warn('Failed to read from sessionStorage:', error);
        return defaultValue || null;
      }
    },
    
    remove: (key: string): void => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove from sessionStorage:', error);
      }
    },
    
    clear: (): void => {
      try {
        sessionStorage.clear();
      } catch (error) {
        console.warn('Failed to clear sessionStorage:', error);
      }
    },
  },
  
  // Cookie 工具
  cookie: {
    set: (name: string, value: string, days?: number): void => {
      let expires = '';
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + value + expires + '; path=/';
    },
    
    get: (name: string): string | null => {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },
    
    remove: (name: string): void => {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    },
  },
};