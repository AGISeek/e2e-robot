"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, ArrowRight, CheckCircle } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    "请输入需要测试的目标网站",
    "例如：https://example.com",
    "测试登录功能和购物车流程",
    "检测响应式设计和性能",
    "验证表单提交和数据处理"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Navigate to create page with input as parameter
    router.push(`/create?input=${encodeURIComponent(input.trim())}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 主渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900"></div>
      
      {/* 动态渐变色彩层 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-500/30 to-pink-400/20 dark:from-blue-600/30 dark:via-purple-700/40 dark:to-pink-600/30"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-orange-300/25 via-transparent to-blue-400/20 dark:from-orange-600/35 dark:via-transparent dark:to-blue-700/30"></div>
      
      {/* 动态斑点效果 */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-40 animate-blob"></div>
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-400 to-orange-400 dark:from-pink-600 dark:to-orange-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-40 animate-blob animation-delay-4000"></div>
      
      {/* 细微纹理叠加 */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAzIj4KICAgICAgPGNpcmNsZSBjeD0iNyIgY3k9IjciIHI9IjEiLz4KICAgICAgPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIvPgogICAgICA8Y2lyY2xlIGN4PSI0MyIgY3k9IjQzIiByPSIxIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K')] pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16 max-w-4xl mx-auto">
            {/* Logo and Title */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                  <Bot className="h-8 w-8" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700 dark:from-neutral-100 dark:via-neutral-200 dark:to-neutral-300 bg-clip-text text-transparent">
                    E2E Robot
                  </span>
                </h1>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-12 leading-relaxed font-light">
              Create end-to-end tests by chatting with AI
            </p>

            {/* Main Input */}
            <div className="max-w-2xl mx-auto mb-8">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder={placeholders[placeholderIndex]}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-14 pl-6 pr-14 text-lg bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-lg transition-all duration-300 focus:shadow-xl focus:scale-[1.02] placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim()}
                    className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              
              {/* Hint text */}
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-3">
                输入网站 URL 或描述测试需求，AI 将自动生成完整的测试方案
              </p>
            </div>

            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-full border border-neutral-200 dark:border-neutral-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">智能分析</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-full border border-neutral-200 dark:border-neutral-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">AI 生成</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-full border border-neutral-200 dark:border-neutral-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">自动执行</span>
              </div>
            </div>
          </div>


          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group">
              <div className="h-full p-8 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-3xl border border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl">
                    🔍
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
                  智能分析
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  自动分析网站结构，识别可测试元素和交互点，为您生成最优的测试策略
                </p>
              </div>
            </div>

            <div className="group">
              <div className="h-full p-8 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-3xl border border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl">
                    🤖
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
                  AI 生成
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  基于 Claude AI 自动生成完整的 Playwright 测试代码，覆盖各种测试场景
                </p>
              </div>
            </div>

            <div className="group">
              <div className="h-full p-8 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-3xl border border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-2xl">
                    ⚡
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
                  自动执行
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  智能执行测试并提供详细的测试报告和错误修复建议，确保测试质量
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}