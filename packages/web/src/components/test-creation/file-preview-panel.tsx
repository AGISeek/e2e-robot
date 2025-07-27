import { Eye, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileContent } from "@/types/sse";
import { TestPlanTab } from "./test-plan-tab";
import { FileTab } from "./file-tab";
import { EmptyStateHelp } from "./empty-state-help";
import { getFileIcon, getDisplayName } from "./file-utils";

interface FilePreviewPanelProps {
  files: FileContent[];
  testPlan: string;
  isGenerating: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onViewCode?: () => void;
  onRunTest?: () => void;
}

/**
 * 文件预览面板组件
 */
export function FilePreviewPanel({
  files,
  testPlan,
  isGenerating,
  activeTab,
  setActiveTab,
  onViewCode,
  onRunTest,
}: FilePreviewPanelProps) {
  const hasContent = files.length > 0 || testPlan;

  if (!hasContent) {
    return (
      <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              测试产出文件
            </h2>
            <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Database className="h-4 w-4" />
              <span>0 个项目</span>
            </div>
          </div>
        </div>
        <EmptyStateHelp />
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col flex-1 min-h-0">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            测试产出文件
          </h2>
          <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Database className="h-4 w-4" />
            <span>{files.length + (testPlan ? 1 : 0)} 个项目</span>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col flex-1 min-h-0 overflow-hidden"
      >
        <div className="px-4 pt-3 flex-shrink-0">
          <TabsList
            className="grid w-full"
            style={{
              gridTemplateColumns: `repeat(${
                files.length + (testPlan ? 1 : 0)
              }, minmax(0, 1fr))`,
            }}
          >
            {/* 测试方案Tab */}
            {testPlan && (
              <TabsTrigger
                value="test-plan"
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span className="truncate">测试方案</span>
              </TabsTrigger>
            )}

            {/* 文件Tabs */}
            {files.map((file) => (
              <TabsTrigger
                key={file.id}
                value={file.id}
                className="flex items-center space-x-2"
              >
                {getFileIcon(file.type)}
                <span className="truncate">{getDisplayName(file.name)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="p-4 flex-1 min-h-0">
          {/* 测试方案内容 */}
          {testPlan && (
            <TabsContent
              value="test-plan"
              className="mt-0 h-full flex flex-col min-h-0"
            >
              <TestPlanTab
                testPlan={testPlan}
                isGenerating={isGenerating}
                onViewCode={onViewCode}
                onRunTest={onRunTest}
              />
            </TabsContent>
          )}

          {/* 文件内容 */}
          {files.map((file) => (
            <TabsContent
              key={file.id}
              value={file.id}
              className="mt-0 h-full flex flex-col min-h-0"
            >
              <FileTab file={file} />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}