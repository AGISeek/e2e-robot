/**
 * 测试创建页面头部组件 - 紧凑版
 */

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Code, Globe } from 'lucide-react';

interface TestCreationHeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  targetUrl: string;
  onExport: () => void;
  onViewCode: () => void;
  isGenerating: boolean;
  hasFiles: boolean;
  // 进度相关
  currentStep: number;
  progress: number;
  steps: Array<{ name: string; description: string; icon: string }>;
}

export function TestCreationHeader({
  projectName,
  onProjectNameChange,
  targetUrl,
  onExport,
  onViewCode,
  isGenerating,
  hasFiles,
  currentStep,
  progress,
  steps,
}: TestCreationHeaderProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-2">
      {/* 第一行：主要信息和操作 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Globe className="h-4 w-4 text-blue-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 truncate">
                {targetUrl || '未指定目标'}
              </span>
              <Input
                placeholder="项目名称"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                className="h-6 text-xs max-w-32 px-2"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewCode}
            disabled={!hasFiles || isGenerating}
            className="h-6 px-2 text-xs"
          >
            <Code className="h-3 w-3 mr-1" />
            代码
          </Button>
          
          <Button
            size="sm"
            onClick={onExport}
            disabled={!hasFiles || isGenerating}
            className="h-6 px-2 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            导出
          </Button>
        </div>
      </div>
      
              {/* 第二行：进度条和步骤 */}
      <div className="flex-1">
        {/* 标题、步骤和百分比在一行 */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">执行进度</span>
          
          {/* 中间的步骤标签 - 放置在5段线段中心 */}
          <div className="flex-1 flex justify-center px-4">
            <div className="w-full relative">
              {/* 5个步骤文字，放置在5段线段的中心位置 */}
              {steps.map((step, index) => {
                // 圆点位置：20%, 40%, 60%, 80%
                // 5个线段：0-20%, 20-40%, 40-60%, 60-80%, 80-100%
                // 5个线段中心位置：10%, 30%, 50%, 70%, 90%
                const leftPosition = 10 + (index * 20); // 从10%开始，每隔20%
                
                return (
                  <div 
                    key={index}
                    className={`absolute text-xs transform -translate-x-1/2 -translate-y-1 text-center whitespace-nowrap min-w-0 ${
                      index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
                    }`}
                    style={{ 
                      left: `${leftPosition}%`,
                      width: 'max-content'
                    }}
                  >
                    {step.name}
                  </div>
                );
              })}
            </div>
          </div>
          
          <Badge variant="secondary" className="h-4 px-1 text-xs">
            {Math.round(progress)}%
          </Badge>
        </div>
        
        {/* 进度条 - 4个圆点 */}
        <div className="relative w-full bg-gray-200 rounded-full h-1 px-4">
          {/* 进度条填充 */}
          <div 
            className="bg-blue-600 h-1 rounded-full transition-all duration-300 absolute left-0 top-0"
            style={{ width: `${progress}%` }}
          />
          
          {/* 4个圆点，分别在 20%, 40%, 60%, 80% 位置，对应5个线段的边界 */}
          {[1, 2, 3, 4].map((index) => {
            const leftPosition = (index / 5) * 100; // 4个点均匀分布：20%, 40%, 60%, 80%
            
            return (
              <div
                key={index}
                className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-white transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300'
                }`}
                style={{ 
                  left: `${leftPosition}%`,
                  boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.8)'
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}