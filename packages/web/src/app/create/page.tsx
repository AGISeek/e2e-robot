"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// New architecture imports
import { useTestGeneration } from "@/contexts/test-generation-context";
import { useApp } from "@/contexts/app-context";
import { api } from "@/lib/api-client";
import { AppError, handleError } from "@/lib/error-handling";

// Components
import { BackgroundLayout } from "@/components/test-creation/background-layout";
import { TestCreationHeader } from "@/components/test-creation/header";
import { 
  AIChatPanel, 
  ErrorDisplay, 
  FilePreviewPanel 
} from "@/components/test-creation";
import { PerformanceMonitor } from "@/components/performance-monitor";

function CreateTestPageContent() {
  const searchParams = useSearchParams();
  const [projectName, setProjectName] = useState("");

  const initialInput = searchParams.get("input") || "";

  // New state management
  const { state, actions, computed } = useTestGeneration();
  const { notify, actions: appActions } = useApp();

  // Extract state for backward compatibility
  const {
    isGenerating,
    progress,
    currentStep,
    error,
    chatMessages,
    workflowStatus,
    files,
    activeFileId,
  } = state;

  // Computed values
  const { hasFiles, activeFile } = computed;

  // Enhanced start generation with new API client and error handling
  const handleStartGeneration = async (input: string) => {
    try {
      actions.startGeneration();
      appActions.setGlobalLoading(true, "正在初始化测试生成...");

      // Use new API client for streaming
      await api.stream(
        "/api/test-generation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input }),
        },
        (message) => {
          // Handle SSE messages using new state management
          actions.handleSSEMessage(message);
        },
        (error) => {
          // Enhanced error handling
          const appError = error instanceof AppError 
            ? error 
            : new AppError(error.message || "测试生成失败");
          
          actions.setError(appError);
          handleError(appError);
          notify.error("错误", appError.message);
        },
        () => {
          appActions.setGlobalLoading(false);
          notify.success("测试生成完成", "所有测试用例已成功生成");
        }
      );
    } catch (error) {
      const appError = error instanceof AppError 
        ? error 
        : new AppError("启动测试生成失败");
      
      actions.setError(appError);
      handleError(appError);
      notify.error("错误", appError.message);
      appActions.setGlobalLoading(false);
    }
  };

  // Auto-start generation if input is provided
  useEffect(() => {
    if (initialInput && !isGenerating && chatMessages.length === 0) {
      handleStartGeneration(initialInput);
    }
  }, [initialInput]);

  // Enhanced event handlers with error handling
  const handleExport = async () => {
    try {
      if (!hasFiles) {
        notify.warning("导出失败", "没有可导出的文件");
        return;
      }

      appActions.setGlobalLoading(true, "正在导出文件...");
      
      // Create and download files
      files.forEach(file => {
        const blob = new Blob([file.content], { 
          type: file.type === 'json' ? 'application/json' : 'text/plain' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      appActions.setGlobalLoading(false);
      notify.success("导出成功", `已导出 ${files.length} 个文件`);
    } catch (error) {
      appActions.setGlobalLoading(false);
      notify.error("导出失败", "请重试");
    }
  };

  const handleViewCode = () => {
    if (!activeFile) {
      notify.warning("查看代码", "请先选择一个文件");
      return;
    }

    // Switch to code view tab
    const codeFile = files.find(f => f.type === 'typescript');
    if (codeFile) {
      actions.setActiveFile(codeFile.id);
    } else {
      notify.info("查看代码", "当前没有代码文件可查看");
    }
  };

  const handleRetry = () => {
    if (initialInput) {
      actions.resetState();
      handleStartGeneration(initialInput);
    } else {
      notify.warning("重试失败", "没有可重试的输入");
    }
  };

  const handleClearError = () => {
    actions.setError(null);
  };

  // Get steps for progress bar
  const steps = [
    { name: "分析目标", description: "正在分析网站结构和测试需求", icon: "Bot" },
    { name: "生成方案", description: "基于 AI 生成完整的测试策略", icon: "Code" },
    { name: "优化测试", description: "优化测试用例和执行流程", icon: "CheckCircle" },
    { name: "执行测试", description: "运行测试并收集结果", icon: "Play" },
    { name: "准备预览", description: "生成测试代码和预览界面", icon: "Eye" },
  ];

  return (
    <BackgroundLayout>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Compact Header with Progress */}
        <TestCreationHeader
          projectName={projectName}
          onProjectNameChange={setProjectName}
          targetUrl={initialInput}
          onExport={handleExport}
          onViewCode={handleViewCode}
          isGenerating={isGenerating}
          hasFiles={hasFiles}
          currentStep={currentStep}
          progress={progress}
          steps={steps}
        />

        {/* Main Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Panel - AI Chat */}
          <div className="w-1/2 flex flex-col border-r border-border/50 min-h-0">
            <AIChatPanel
              messages={chatMessages}
              isGenerating={isGenerating}
              onRetry={handleRetry}
              onStartGeneration={handleStartGeneration}
              initialInput={initialInput}
            />
          </div>

          {/* Right Panel - File Preview */}
          <div className="w-1/2 flex flex-col min-h-0">
            <FilePreviewPanel
              files={files}
              activeFileId={activeFileId}
              onFileSelect={actions.setActiveFile}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorDisplay
            error={error}
            onRetry={handleRetry}
            onDismiss={handleClearError}
          />
        )}
      </div>

      {/* Performance Monitor (Development only) */}
      <PerformanceMonitor enabled={process.env.NODE_ENV === 'development'} />
      
    </BackgroundLayout>
  );
}

export default function CreateTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>正在加载...</span>
          </div>
        </div>
      }
    >
      <CreateTestPageContent />
    </Suspense>
  );
}