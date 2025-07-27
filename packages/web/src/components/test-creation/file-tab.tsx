import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { FileContent } from "@/types/sse";
import { FileContentRenderer } from "@/components/file-content-renderer";
import { formatFileSize, downloadFile } from "./file-utils";

interface FileTabProps {
  file: FileContent;
}

/**
 * 文件标签页内容
 */
export function FileTab({ file }: FileTabProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 文件信息 */}
      <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span>文件: {file.name}</span>
          <span>大小: {formatFileSize(file.size)}</span>
          <span>类型: {file.type}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadFile(file)}
          className="flex items-center space-x-1"
        >
          <Download className="h-3 w-3" />
          <span>下载</span>
        </Button>
      </div>

      {/* 文件内容 */}
      <div className="flex-1 min-h-0">
        <FileContentRenderer file={file} />
      </div>
    </div>
  );
}