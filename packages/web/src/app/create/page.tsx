"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Bot,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Code,
  Eye,
  Loader2,
  FileText,
  Database,
  FileCode,
} from "lucide-react";
import {
  SSEMessage,
  TestSteps,
  ChatMessage,
  WorkflowStatus,
  FileContent,
  FileMessage,
} from "@/types/sse";
import { FileContentRenderer } from "@/components/file-content-renderer";

function CreateTestPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [testPlan, setTestPlan] = useState("");
  const [projectName, setProjectName] = useState("");
  const [stepMessages, setStepMessages] = useState<{ [key: number]: string }>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(
    null
  );
  const [files, setFiles] = useState<FileContent[]>([]);
  const [activeTab, setActiveTab] = useState<string>("help");
  const eventSourceRef = useRef<EventSource | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const initialInput = searchParams.get("input") || "";

  // Helper functions for file display
  const getFileIcon = (fileType: string) => {
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

  const getDisplayName = (fileName: string) => {
    // Remove file extension for cleaner display
    const name = fileName.replace(/\.[^/.]+$/, "");
    // Convert kebab-case to readable format
    return name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const downloadFile = (file: FileContent) => {
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

  const steps = [
    { name: "分析目标", description: "正在分析网站结构和测试需求", icon: Bot },
    { name: "生成方案", description: "基于 AI 生成完整的测试策略", icon: Code },
    {
      name: "优化测试",
      description: "优化测试用例和执行流程",
      icon: CheckCircle,
    },
    { name: "执行测试", description: "运行测试并收集结果", icon: Play },
    { name: "准备预览", description: "生成测试代码和预览界面", icon: Eye },
  ];

  useEffect(() => {
    if (initialInput) {
      startGeneration();
    }

    // 清理函数，防止组件卸载时内存泄漏
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [initialInput]);

  const startGeneration = async () => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentStep(0);
    setTestPlan("");
    setError(null);
    setStepMessages({});
    setChatMessages([]); // 清空聊天消息
    setWorkflowStatus(null); // 清空工作流状态
    setFiles([]); // 清空文件
    setActiveTab("help"); // 重置到帮助Tab

    try {
      // 创建 SSE 连接
      const response = await fetch("/api/test-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: initialInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 处理可能包含多条消息的缓冲区
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // 保留不完整的行

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const messageData = line.slice(6); // 移除 'data: ' 前缀
              if (messageData.trim()) {
                const message: SSEMessage = JSON.parse(messageData);
                handleSSEMessage(message);
              }
            } catch (e) {
              console.error("Failed to parse SSE message:", e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      setError(error.message || "生成过程中出现错误");
      setIsGenerating(false);
    }
  };

  const handleSSEMessage = (message: SSEMessage) => {
    console.log("Received SSE message:", message);

    switch (message.type) {
      case "chat":
        const chatMessage = message.data as ChatMessage;
        // 检查消息是否已存在，避免重复添加
        setChatMessages((prev) => {
          const exists = prev.some((msg) => msg.id === chatMessage.id);
          if (exists) {
            return prev; // 如果消息已存在，不添加
          }
          return [...prev, chatMessage];
        });
        // 自动滚动到底部
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        break;

      case "file":
        const fileData = message.data as FileMessage;
        setFiles(fileData.files);
        // 如果有文件，自动切换到第一个文件的Tab
        if (fileData.files.length > 0 && activeTab === "help") {
          setActiveTab(fileData.files[0].id);
        }
        break;

      case "workflow":
        const workflowData = message.data as WorkflowStatus;
        setWorkflowStatus(workflowData);
        setCurrentStep(workflowData.currentStep - 1); // Convert to 0-based index
        setProgress(workflowData.progress);
        break;

      case "step":
        const stepData = message.data;
        setCurrentStep(stepData.step - 1); // Convert to 0-based index
        if (stepData.status === "completed") {
          setStepMessages((prev) => ({
            ...prev,
            [stepData.step]: `✅ ${stepData.name} 完成`,
          }));
        } else if (stepData.status === "starting") {
          setStepMessages((prev) => ({
            ...prev,
            [stepData.step]: `🔄 ${stepData.description}`,
          }));
        }
        break;

      case "progress":
        const progressData = message.data;
        const overallProgress =
          ((progressData.step - 1) * 100 + progressData.progress) /
          steps.length;
        setProgress(overallProgress);
        if (progressData.message) {
          setStepMessages((prev) => ({
            ...prev,
            [progressData.step]: progressData.message,
          }));
        }
        break;

      case "result":
        const resultData = message.data;
        if (resultData.success && resultData.content) {
          // 如果是最后一步的结果，更新测试方案
          if (resultData.step >= 3) {
            setTestPlan(resultData.content);
          }
        }
        break;

      case "complete":
        const completeData = message.data;
        setIsGenerating(false);
        setProgress(100);
        if (completeData.success) {
          // 生成完整的测试方案摘要
          const summaryPlan = `
🎯 测试目标: ${initialInput}

📋 测试方案概览:
${completeData.summary}

🔧 生成文件:
• 网站分析: ${completeData.results.analysisFile ? "✅ 已生成" : "❌ 未生成"}
• 测试场景: ${completeData.results.scenarioFile ? "✅ 已生成" : "❌ 未生成"}
• 测试用例: ${completeData.results.testCaseFile ? "✅ 已生成" : "❌ 未生成"}
• 执行结果: ${completeData.results.testResults ? "✅ 已生成" : "❌ 未生成"}

📊 完成状态:
• 总步骤: ${completeData.totalSteps}
• 完成步骤: ${completeData.completedSteps}
• 成功率: ${Math.round(
            (completeData.completedSteps / completeData.totalSteps) * 100
          )}%

⚡ 技术实现:
• 测试框架: Playwright
• 语言: TypeScript
• 报告: HTML + JSON 格式
• 执行环境: Chrome, Firefox, Safari
          `;
          setTestPlan(summaryPlan);
          // 自动切换到测试方案Tab
          if (activeTab === "help") {
            setActiveTab("test-plan");
          }
        }
        break;

      case "error":
        const errorData = message.data;
        setError(errorData.error);
        if (!errorData.recoverable) {
          setIsGenerating(false);
        }
        break;
    }
  };

  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      {/* 与首页相同的背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-500/30 to-pink-400/20 dark:from-blue-600/30 dark:via-purple-700/40 dark:to-pink-600/30"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-orange-300/25 via-transparent to-blue-400/20 dark:from-orange-600/35 dark:via-transparent dark:to-blue-700/30"></div>

      {/* 动态斑点 */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-40 animate-blob"></div>
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-400 to-orange-400 dark:from-pink-600 dark:to-orange-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-40 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="container mx-auto px-3 py-3 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-lg hover:bg-white/20 dark:hover:bg-black/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  创建测试方案
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  测试目标网站：
                  {initialInput || "请在首页输入测试需求后跳转到此页面"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Input
                placeholder="项目名称"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-48 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-neutral-200 dark:border-neutral-700"
              />
              <Button
                variant="outline"
                className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-neutral-200 dark:border-neutral-700"
              >
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </div>

          {/* Workflow Progress Bar */}
          {workflowStatus && (
            <div className="mb-3 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg px-3 py-1 border border-neutral-200 dark:border-neutral-700 shadow-sm flex-shrink-0 h-[28px] flex items-center">
              <div className="flex items-center w-full space-x-3">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${workflowStatus.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 w-50">
                  <div className="text-right flex-1">
                    <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate pr-2">
                        {workflowStatus.stepName}
                      </span>
                      步骤 {workflowStatus.currentStep} /{" "}
                      {workflowStatus.totalSteps}{" "}
                      {Math.round(workflowStatus.progress)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 主要内容区域 - 占满剩余高度 */}
          <div className="flex flex-col lg:flex-row gap-2 flex-1 min-h-0 overflow-hidden">
            {/* 左侧 - AI 聊天对话框 - 大屏40%，小屏100% */}
            <div className="flex flex-col lg:w-2/5 w-full min-h-0 overflow-hidden">
              {/* AI 聊天对话框 */}
              <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        AI 执行过程
                      </h2>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        实时显示 Claude Code 执行过程
                      </p>
                    </div>
                  </div>
                </div>

                {/* 聊天消息区域 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {chatMessages.length === 0 && !isGenerating && (
                    <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                      等待开始生成测试...
                    </div>
                  )}

                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.type === "user"
                            ? "bg-blue-500 text-white"
                            : message.type === "assistant"
                            ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                            : message.type === "tool"
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200 border border-orange-200 dark:border-orange-700"
                            : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type !== "user" && (
                            <div className="flex-shrink-0 mt-1">
                              {message.type === "assistant" && (
                                <Bot className="h-4 w-4" />
                              )}
                              {message.type === "tool" && (
                                <Code className="h-4 w-4" />
                              )}
                              {message.type === "system" && (
                                <AlertCircle className="h-4 w-4" />
                              )}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="text-sm">{message.content}</div>
                            {message.stepName && (
                              <div className="text-xs opacity-70 mt-1">
                                {message.stepName}
                              </div>
                            )}
                            {message.metadata?.tokens && (
                              <div className="text-xs opacity-70 mt-1">
                                输入: {message.metadata.tokens.input} | 输出:{" "}
                                {message.metadata.tokens.output}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* 滚动锚点 */}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* 错误显示 */}
              {error && (
                <div className="mt-3 bg-red-50 dark:bg-red-900/30 backdrop-blur-sm rounded-lg p-4 border border-red-200 dark:border-red-700 shadow-sm flex-shrink-0">
                  <div className="flex items-center mb-3">
                    <div className="p-2 rounded-lg bg-red-500 text-white mr-3">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
                      生成失败
                    </h2>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/50 rounded-lg p-3 border border-red-200 dark:border-red-700">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <Button
                      onClick={() => {
                        setError(null);
                        startGeneration();
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      重新尝试
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      className="border-red-200 dark:border-red-700"
                    >
                      返回
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 右侧 - 预览区域 - 大屏60%，小屏100% */}
            <div className="flex flex-col lg:w-3/5 w-full min-h-0 overflow-hidden">
              {/* 文件内容窗口 */}
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

                {files.length > 0 || testPlan ? (
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
                            <span className="truncate">
                              {getDisplayName(file.name)}
                            </span>
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
                          <div className="flex flex-col h-full min-h-0">
                            {/* 测试方案操作 */}
                            <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex-shrink-0">
                              <div className="flex items-center space-x-4">
                                <span>测试方案摘要</span>
                                <span>
                                  状态: {isGenerating ? "生成中" : "已完成"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                  <Code className="h-4 w-4 mr-2" />
                                  查看代码
                                </Button>
                                <Button size="sm">
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
                        </TabsContent>
                      )}

                      {/* 文件内容 */}
                      {files.map((file) => (
                        <TabsContent
                          key={file.id}
                          value={file.id}
                          className="mt-0 h-full flex flex-col min-h-0"
                        >
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
                        </TabsContent>
                      ))}
                    </div>
                  </Tabs>
                ) : (
                  <div className="p-4 flex-1 min-h-0 overflow-hidden">
                    <Tabs
                      value="help"
                      className="w-full h-full flex flex-col"
                    >
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
                                  <div className="font-medium">
                                    website-analysis.md
                                  </div>
                                  <div className="text-sm text-neutral-500">
                                    网站结构分析报告
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                                <FileText className="h-5 w-5 text-green-500" />
                                <div>
                                  <div className="font-medium">
                                    test-scenarios.md
                                  </div>
                                  <div className="text-sm text-neutral-500">
                                    测试场景设计文档
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                                <FileCode className="h-5 w-5 text-purple-500" />
                                <div>
                                  <div className="font-medium">
                                    generated-tests.spec.ts
                                  </div>
                                  <div className="text-sm text-neutral-500">
                                    Playwright 测试用例代码
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                                <Database className="h-5 w-5 text-orange-500" />
                                <div>
                                  <div className="font-medium">
                                    test-results.json
                                  </div>
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>正在加载...</p>
          </div>
        </div>
      }
    >
      <CreateTestPageContent />
    </Suspense>
  );
}
