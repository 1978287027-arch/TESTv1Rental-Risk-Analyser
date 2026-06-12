"use client";

import { useState } from "react";
import InputForm from "@/app/components/InputForm";
import ReportView from "@/app/components/ReportView";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import type { PageState, AnalyzeRequest, AnalysisResult } from "@/app/lib/types";

export default function Home() {
  const [state, setState] = useState<PageState>("input");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: AnalyzeRequest) => {
    setState("loading");
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "请求失败");
      }

      setResult(json);
      setState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败，请重试");
      setState("input");
    }
  };

  const handleReset = () => {
    setState("input");
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🏠 租房风险分析师</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              AI 驱动的房源风险评估工具
            </p>
          </div>
          {state === "result" && (
            <button
              onClick={handleReset}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              ← 返回
            </button>
          )}
        </div>
      </header>

      {/* 主体 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {state === "input" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                ⚠️ {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-2 text-red-500 hover:text-red-700 font-medium cursor-pointer"
                >
                  关闭
                </button>
              </div>
            )}
            <InputForm onSubmit={handleSubmit} />
          </div>
        )}

        {state === "loading" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <LoadingOverlay />
          </div>
        )}

        {state === "result" && result && (
          <ReportView result={result} onReset={handleReset} />
        )}

        {/* 页脚 */}
        {state === "input" && (
          <footer className="mt-8 text-center text-xs text-gray-400 space-y-1">
            <p>
              ⚠️ 分析结果由 AI 生成，仅供参考，不构成法律或投资建议
            </p>
            <p>
              租房决策请结合实际情况综合判断
            </p>
          </footer>
        )}
      </div>
    </main>
  );
}
