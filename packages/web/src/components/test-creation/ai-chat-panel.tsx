import { useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { ChatMessage } from "@/types/sse";
import { ChatMessageItem } from "./chat-message-item";

interface AIChatPanelProps {
  chatMessages: ChatMessage[];
  isGenerating: boolean;
}

/**
 * AI 聊天面板组件
 */
export function AIChatPanel({ chatMessages, isGenerating }: AIChatPanelProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [chatMessages]);

  return (
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
          <ChatMessageItem key={message.id} message={message} />
        ))}

        {/* 滚动锚点 */}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}