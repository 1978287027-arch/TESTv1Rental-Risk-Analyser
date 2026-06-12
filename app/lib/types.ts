// ============================================================
// 租房风险分析师 — 类型定义
// ============================================================

/** 房源分析（模块1） */
export interface Module1Analysis {
  imageQuality: string;        // 图片质量评价
  suspectedWebImage: boolean;  // 是否疑似网图
  excessiveBeautification: boolean; // 是否过度美化
  missingInfo: string[];       // 缺失的信息
  riskSignals: string[];       // 明显风险信号
  summary: string;             // 综合小结
}

/** 房源真实性判断（模块2） */
export interface Module2Authenticity {
  type: "房东直租" | "中介" | "品牌公寓" | "无法判断";
  confidence: number;          // 0-100
  reasons: string[];           // 判断依据
}

/** 价格分析（模块3） */
export interface Module3Price {
  level: "偏低" | "合理" | "偏高";
  reasons: string[];           // 判断原因
  detail: string;              // 详细分析
}

/** 避坑建议（模块4） */
export interface Module4Pitfalls {
  risks: {
    title: string;             // 风险名称，如"中介费"
    severity: "高" | "中" | "低";
    description: string;       // 风险说明
  }[];
}

/** 下一步提问建议（模块5） */
export interface Module5Questions {
  questions: {
    priority: number;          // 优先级 1-N
    question: string;          // 建议提问
    reason: string;            // 为什么问这个
  }[];
}

/** 完整分析结果 */
export interface AnalysisResult {
  riskLevel: "A" | "B" | "C" | "D";
  riskScore: number;           // 0-100
  module1: Module1Analysis;
  module2: Module2Authenticity;
  module3: Module3Price;
  module4: Module4Pitfalls;
  module5: Module5Questions;
  overallAdvice: string;       // 综合建议
}

/** 前端请求体 */
export interface AnalyzeRequest {
  images: string[];            // base64 图片（最多5张）
  description: string;
  price: number;
  city: string;
}

/** 前端页面状态 */
export type PageState = "input" | "loading" | "result";
