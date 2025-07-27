"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TestLayoutPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="container mx-auto px-6 py-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-xl hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  布局测试页面
                </h1>
                <p className="text-sm text-neutral-600">
                  测试固定高度布局和内部滚动
                </p>
              </div>
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
            {/* 左侧卡片 */}
            <div className="flex flex-col lg:w-1/2 w-full min-h-0 overflow-hidden">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-neutral-200 shadow-lg overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="p-6 border-b border-neutral-200 flex-shrink-0">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    左侧卡片
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                  <div className="space-y-4">
                    {Array.from({ length: 50 }, (_, i) => (
                      <div key={i} className="p-4 bg-neutral-100 rounded-lg">
                        <h3 className="font-medium">项目 {i + 1}</h3>
                        <p className="text-sm text-neutral-600">
                          这是一个测试项目，用于验证滚动功能是否正常工作。
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧卡片 */}
            <div className="flex flex-col lg:w-1/2 w-full min-h-0 overflow-hidden">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-neutral-200 shadow-lg overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="p-6 border-b border-neutral-200 flex-shrink-0">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    右侧卡片
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                  <div className="space-y-4">
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900">测试说明</h3>
                      <p className="text-sm text-blue-700">
                        这个页面用于测试布局修复效果。你应该看到：
                      </p>
                      <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                        <li>页面没有垂直滚动条</li>
                        <li>两个卡片平铺整个容器</li>
                        <li>卡片内容超出时在卡片内滚动</li>
                        <li>标题和头部始终可见</li>
                      </ul>
                    </div>
                    
                    {Array.from({ length: 30 }, (_, i) => (
                      <div key={i} className="p-4 bg-green-100 rounded-lg">
                        <h3 className="font-medium text-green-900">内容块 {i + 1}</h3>
                        <p className="text-sm text-green-700">
                          这是右侧卡片的内容，用于测试滚动功能。
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 