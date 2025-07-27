/**
 * 简化的测试创建组件集合
 * 提供基本功能以确保应用运行
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileContentRenderer } from '@/components/file-content-renderer';
import { AlertTriangle, RotateCcw, FileText, Play } from 'lucide-react';
import type { ChatMessage, WorkflowStatus, FileContent } from '@/types/sse';
import type { AppError } from '@/lib/error-handling';

// 工作流进度条组件
interface WorkflowProgressBarProps {
  steps: Array<{ name: string; description: string; icon: string }>;
  currentStep: number;
  progress: number;
  workflowStatus: WorkflowStatus | null;
}

export function WorkflowProgressBar({ steps, currentStep, progress }: WorkflowProgressBarProps) {
  return (
    <Card className="mx-4 mb-4 p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium">执行进度</h2>
        <Badge variant="secondary">{Math.round(progress)}%</Badge>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="grid grid-cols-5 gap-2 text-xs">
        {steps.map((step, index) => (
          <div key={index} className={`text-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className="font-medium">{step.name}</div>
            <div className="text-gray-500">{step.description}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// AI 聊天面板组件
interface AIChatPanelProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onRetry: () => void;
  onStartGeneration: (input: string) => void;
  initialInput: string;
}

export function AIChatPanel({ messages, isGenerating, onRetry }: AIChatPanelProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold flex items-center gap-2">
          <Play className="h-4 w-4" />
          AI 执行过程
        </h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <FileText className="h-8 w-8 mx-auto mb-2" />
            <p>等待开始测试生成...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-600 mb-1">
                  {message.type === 'assistant' ? 'AI 助手' : '用户'}
                </div>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isGenerating && (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-sm text-gray-600">正在生成...</span>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <Button onClick={onRetry} disabled={isGenerating} className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" />
          重新生成
        </Button>
      </div>
    </div>
  );
}

// 文件预览面板组件
interface FilePreviewPanelProps {
  files: FileContent[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  isGenerating: boolean;
}

export function FilePreviewPanel({ files, activeFileId, onFileSelect }: FilePreviewPanelProps) {
  const activeFile = files.find(f => f.id === activeFileId);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold">测试产出</h3>
      </div>
      
      {files.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h4 className="font-medium text-gray-900 mb-2">等待生成文件</h4>
            <p className="text-sm text-gray-500">
              测试用例生成完成后，相关文件将在此显示
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Tabs value={activeFileId || files[0]?.id} onValueChange={onFileSelect} className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full justify-start p-2 h-auto flex-wrap shrink-0">
              {files.map((file) => (
                <TabsTrigger key={file.id} value={file.id} className="text-xs">
                  {file.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {files.map((file) => (
              <TabsContent key={file.id} value={file.id} className="flex-1 mt-0 min-h-0 overflow-hidden data-[state=inactive]:hidden">
                <div className="h-full">
                  <FileContentRenderer file={file} className="h-full" />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}

// 错误显示组件
interface ErrorDisplayProps {
  error: AppError;
  onRetry: () => void;
  onDismiss: () => void;
}

export function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  return (
    <Card className="mx-4 mb-4 border-red-200 bg-red-50">
      <div className="p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
          <div className="flex-1">
            <h4 className="font-medium text-red-900">发生错误</h4>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
            {error.context && (
              <details className="mt-2">
                <summary className="text-xs text-red-600 cursor-pointer">查看详情</summary>
                <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
                  {JSON.stringify(error.context, null, 2)}
                </pre>
              </details>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button size="sm" onClick={onRetry}>
              重试
            </Button>
            <Button size="sm" variant="outline" onClick={onDismiss}>
              关闭
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}