import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

/**
 * 错误显示组件
 */
export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const router = useRouter();

  return (
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
          onClick={onRetry}
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
  );
}