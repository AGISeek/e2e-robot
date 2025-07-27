/**
 * 文件工具函数
 */

export const file = {
  // 下载文件
  download: (content: string, filename: string, type: string = 'text/plain'): void => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
  
  // 读取文件
  read: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  },
  
  // 读取文件为 DataURL
  readAsDataURL: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  },
  
  // 获取文件大小
  getSize: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  },
  
  // 获取文件扩展名
  getExtension: (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },
  
  // 验证文件类型
  isValidType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },
  
  // 验证文件大小
  isValidSize: (file: File, maxSizeInMB: number): boolean => {
    return file.size <= maxSizeInMB * 1024 * 1024;
  },
};