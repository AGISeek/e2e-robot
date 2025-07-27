import { forwardRef } from "react";
import { Bot, Code, AlertCircle } from "lucide-react";
import { ChatMessage } from "@/types/sse";

interface ChatMessageItemProps {
  message: ChatMessage;
}

/**
 * 单个聊天消息组件
 */
export const ChatMessageItem = forwardRef<HTMLDivElement, ChatMessageItemProps>(
  ({ message }, ref) => {
    const getMessageStyles = (type: string) => {
      switch (type) {
        case "user":
          return "bg-blue-500 text-white";
        case "assistant":
          return "bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100";
        case "tool":
          return "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200 border border-orange-200 dark:border-orange-700";
        default:
          return "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400";
      }
    };

    return (
      <div
        ref={ref}
        className={`flex ${
          message.type === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[80%] rounded-lg px-3 py-2 ${getMessageStyles(
            message.type
          )}`}
        >
          <div className="flex items-start space-x-2">
            {message.type !== "user" && (
              <div className="flex-shrink-0 mt-1">
                {message.type === "assistant" && <Bot className="h-4 w-4" />}
                {message.type === "tool" && <Code className="h-4 w-4" />}
                {message.type === "system" && <AlertCircle className="h-4 w-4" />}
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
    );
  }
);

ChatMessageItem.displayName = "ChatMessageItem";