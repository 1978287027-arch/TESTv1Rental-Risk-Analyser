"use client";

interface Props {
  riskLevel: string;
  riskScore: number;
  overallAdvice: string;
}

const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  A: { label: "低风险", color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  B: { label: "中等偏低风险", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  C: { label: "中等偏高风险", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  D: { label: "高风险", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
};

const SCORE_BAR_COLOR = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
};

export default function RiskScoreCard({ riskLevel, riskScore, overallAdvice }: Props) {
  const config = LEVEL_CONFIG[riskLevel] || LEVEL_CONFIG.B;

  return (
    <div className={`rounded-2xl p-6 border ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-sm text-gray-500">综合风险评级</span>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-3xl font-bold ${config.color}`}>
              {riskLevel}
            </span>
            <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500">风险评分</span>
          <div className="text-3xl font-bold text-gray-800">{riskScore}</div>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${SCORE_BAR_COLOR(riskScore)}`}
          style={{ width: `${riskScore}%` }}
        />
      </div>

      {/* 综合建议 */}
      <p className="text-sm text-gray-700 leading-relaxed">{overallAdvice}</p>
    </div>
  );
}
