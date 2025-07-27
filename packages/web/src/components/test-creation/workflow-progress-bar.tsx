import { WorkflowStatus } from "@/types/sse";

interface WorkflowProgressBarProps {
  workflowStatus: WorkflowStatus;
}

/**
 * 工作流进度条组件
 */
export function WorkflowProgressBar({ workflowStatus }: WorkflowProgressBarProps) {
  return (
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
              步骤 {workflowStatus.currentStep} / {workflowStatus.totalSteps}{" "}
              {Math.round(workflowStatus.progress)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}