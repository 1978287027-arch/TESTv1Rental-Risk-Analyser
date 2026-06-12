"use client";

export default function LoadingOverlay() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      {/* 动画 spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">🔍</span>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">正在分析房源...</h3>
        <p className="text-sm text-gray-500">
          AI 正在对图片、文案、价格进行全面评估，预计需要 5-10 秒
        </p>
      </div>

      {/* 进度指示 */}
      <div className="flex gap-1.5">
        {[
          "分析图片",
          "判断真实性",
          "评估价格",
          "生成建议",
        ].map((step, i) => (
          <span
            key={step}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.3}s` }}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
