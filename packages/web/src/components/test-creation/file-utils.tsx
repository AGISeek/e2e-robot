import { FileText, Database, FileCode } from "lucide-react";

/**
 * 获取文件类型对应的图标
 */
export const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "markdown":
      return <FileText className="h-4 w-4" />;
    case "typescript":
      return <FileCode className="h-4 w-4" />;
    case "json":
      return <Database className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

/**
 * 获取文件显示名称（移除扩展名并格式化）
 */
export const getDisplayName = (fileName: string) => {
  // Remove file extension for cleaner display
  const name = fileName.replace(/\.[^/.]+$/, "");
  // Convert kebab-case to readable format
  return name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * 下载文件
 */
export const downloadFile = (file: { name: string; content: string }) => {
  const blob = new Blob([file.content], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};