"use client";

import { AnalysisResult } from "@/app/lib/types";
import RiskScoreCard from "./RiskScoreCard";
import ModuleCard from "./ModuleCard";

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

export default function ReportView({ result, onReset }: Props) {
  const { module1, module2, module3, module4, module5 } = result;

  return (
    <div className="space-y-6">
      {/* 头部评分卡 */}
      <RiskScoreCard
        riskLevel={result.riskLevel}
        riskScore={result.riskScore}
        overallAdvice={result.overallAdvice}
      />

      {/* 模块1：房源分析 */}
      <ModuleCard title="房源分析" icon="📋">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoItem label="图片质量" value={module1.imageQuality} />
          <InfoItem
            label="疑似网图"
            value={module1.suspectedWebImage ? "⚠️ 是" : "✅ 否"}
            warn={module1.suspectedWebImage}
          />
          <InfoItem
            label="过度美化"
            value={module1.excessiveBeautification ? "⚠️ 是" : "✅ 否"}
            warn={module1.excessiveBeautification}
          />
          <div className="col-span-full">
            <InfoItem
              label="缺失信息"
              value={module1.missingInfo.length > 0 ? module1.missingInfo.join("、") : "暂无"}
              warn={module1.missingInfo.length > 0}
            />
          </div>
          {module1.riskSignals.length > 0 && (
            <div className="col-span-full">
              <p className="text-xs text-gray-500 mb-1">⚠️ 风险信号</p>
              <ul className="list-disc list-inside space-y-1">
                {module1.riskSignals.map((s, i) => (
                  <li key={i} className="text-red-600">{s}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="col-span-full">
            <p className="text-gray-600 text-xs leading-relaxed">{module1.summary}</p>
          </div>
        </div>
      </ModuleCard>

      {/* 模块2：真实性判断 */}
      <ModuleCard title="真实性判断" icon="🔍">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg font-bold text-gray-800">{module2.type}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            置信度 {module2.confidence}%
          </span>
        </div>
        <ul className="list-disc list-inside space-y-1">
          {module2.reasons.map((r, i) => (
            <li key={i} className="text-gray-600">{r}</li>
          ))}
        </ul>
      </ModuleCard>

      {/* 模块3：价格分析 */}
      <ModuleCard title="价格分析" icon="💰">
        <p className={`font-bold text-lg ${
          module3.level === "偏高" ? "text-red-600" :
          module3.level === "偏低" ? "text-orange-600" :
          "text-green-600"
        }`}>
          {module3.level}
        </p>
        <ul className="list-disc list-inside space-y-1">
          {module3.reasons.map((r, i) => (
            <li key={i} className="text-gray-600">{r}</li>
          ))}
        </ul>
        <p className="text-gray-500 text-xs mt-1">{module3.detail}</p>
      </ModuleCard>

      {/* 模块4：避坑建议 */}
      <ModuleCard title="避坑建议" icon="⚠️">
        <div className="space-y-3">
          {module4.risks.map((risk, i) => (
            <div key={i} className="border-l-3 pl-3 border-gray-200">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-gray-800">{risk.title}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  risk.severity === "高" ? "bg-red-100 text-red-700" :
                  risk.severity === "中" ? "bg-orange-100 text-orange-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {risk.severity}风险
                </span>
              </div>
              <p className="text-xs text-gray-500">{risk.description}</p>
            </div>
          ))}
        </div>
      </ModuleCard>

      {/* 模块5：下一步提问建议 */}
      <ModuleCard title="下一步提问建议" icon="❓">
        <ol className="space-y-3">
          {module5.questions.map((q) => (
            <li key={q.priority} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                {q.priority}
              </span>
              <div>
                <p className="text-gray-800 font-medium">{q.question}</p>
                <p className="text-xs text-gray-500 mt-0.5">原因：{q.reason}</p>
              </div>
            </li>
          ))}
        </ol>
      </ModuleCard>

      {/* 重新分析按钮 */}
      <button
        onClick={onReset}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors text-sm cursor-pointer"
      >
        🔄 重新分析
      </button>
    </div>
  );
}

/** 信息行小组件 */
function InfoItem({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm ${warn ? "text-red-600 font-medium" : "text-gray-700"}`}>
        {value}
      </p>
    </div>
  );
}
