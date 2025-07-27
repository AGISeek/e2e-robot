import { Button } from "@/components/ui/button";
import { Code, Play, Download } from "lucide-react";
import { downloadFile } from "./file-utils";

interface TestPlanTabProps {
  testPlan: string;
  isGenerating: boolean;
  onViewCode?: () => void;
  onRunTest?: () => void;
}

/**
 * 测试方案标签页内容
 */
export function TestPlanTab({
  testPlan,
  isGenerating,
  onViewCode,
  onRunTest,
}: TestPlanTabProps) {
  const handleDownload = () => {
    downloadFile({
      name: "test-plan.txt",
      content: testPlan,
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 测试方案操作 */}
      <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span>测试方案摘要</span>
          <span>状态: {isGenerating ? "生成中" : "已完成"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            下载
          </Button>
          <Button size="sm" variant="outline" onClick={onViewCode}>
            <Code className="h-4 w-4 mr-2" />
            查看代码
          </Button>
          <Button size="sm" onClick={onRunTest}>
            <Play className="h-4 w-4 mr-2" />
            开始测试
          </Button>
        </div>
      </div>

      {/* 测试方案内容 */}
      <div className="flex-1 min-h-0">
        <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700 h-full overflow-y-auto min-h-0">
          <pre className="whitespace-pre-wrap text-sm text-neutral-800 dark:text-neutral-200 font-mono">
            {testPlan}
          </pre>
        </div>
      </div>
    </div>
  );
}