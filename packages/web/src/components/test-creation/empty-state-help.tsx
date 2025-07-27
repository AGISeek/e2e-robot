import { FileText, Database, FileCode } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * 空状态帮助面板
 */
export function EmptyStateHelp() {
  return (
    <div className="p-4 flex-1 min-h-0 overflow-hidden">
      <Tabs value="help" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-1 flex-shrink-0">
          <TabsTrigger value="help">
            <FileText className="h-4 w-4 mr-2" />
            执行说明
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="help"
          className="mt-3 flex-1 min-h-0 overflow-y-auto"
        >
          <div className="space-y-3 text-neutral-600 dark:text-neutral-400">
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="h-8 w-8 text-neutral-500" />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                等待测试文件生成
              </h3>
              <p className="text-sm mb-6">
                AI 正在分析您的测试需求并生成相应的测试文件
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                将会生成以下文件：
              </h4>
              <div className="grid gap-3">
                <div className="flex items-center space-x-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">website-analysis.md</div>
                    <div className="text-sm text-neutral-500">
                      网站结构分析报告
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <FileText className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">test-scenarios.md</div>
                    <div className="text-sm text-neutral-500">
                      测试场景设计文档
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <FileCode className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium">generated-tests.spec.ts</div>
                    <div className="text-sm text-neutral-500">
                      Playwright 测试用例代码
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <Database className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="font-medium">test-results.json</div>
                    <div className="text-sm text-neutral-500">
                      测试执行结果报告
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}