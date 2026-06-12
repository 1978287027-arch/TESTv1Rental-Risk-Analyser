// ============================================================
// 租房风险分析师 — 工具函数
// ============================================================

import { AnalyzeRequest, AnalysisResult } from "./types";

/** 最大图片数量 */
export const MAX_IMAGES = 5;
/** 单张图片最大大小（base64 编码前）约 5MB */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
/** 分析超时时间（毫秒） */
export const ANALYZE_TIMEOUT = 60000;

/** 校验表单数据 */
export function validateRequest(data: Partial<AnalyzeRequest>): string | null {
  if (!data.description || data.description.trim().length === 0) {
    return "请填写房源描述";
  }
  if (data.description.trim().length < 10) {
    return "房源描述至少需要10个字符";
  }
  if (!data.price || data.price <= 0) {
    return "请填写有效的月租金";
  }
  if (data.price > 100000) {
    return "月租金数值异常，请检查";
  }
  if (!data.city || data.city.trim().length === 0) {
    return "请填写城市";
  }
  if (data.images && data.images.length > MAX_IMAGES) {
    return `最多上传 ${MAX_IMAGES} 张图片`;
  }
  return null;
}

/** 压缩 base64 图片（简单裁剪，不引入额外依赖） */
export function compressImage(base64: string, maxWidth = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // 如果图片已经足够小，直接返回
      if (img.width <= maxWidth) {
        resolve(base64);
        return;
      }

      const ratio = maxWidth / img.width;
      const canvas = document.createElement("canvas");
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64);
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => resolve(base64); // 失败时返回原图
    img.src = base64;
  });
}

/** 将 File 转为 base64 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** 验证 LLM 返回的 JSON 是否符合预期结构 */
export function isValidAnalysisResult(data: unknown): data is AnalysisResult {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;

  if (typeof d.riskLevel !== "string" || !["A", "B", "C", "D"].includes(d.riskLevel)) return false;
  if (typeof d.riskScore !== "number" || d.riskScore < 0 || d.riskScore > 100) return false;
  if (typeof d.overallAdvice !== "string") return false;

  // 简单检查子模块存在性
  if (!d.module1 || typeof d.module1 !== "object") return false;
  if (!d.module2 || typeof d.module2 !== "object") return false;
  if (!d.module3 || typeof d.module3 !== "object") return false;
  if (!d.module4 || typeof d.module4 !== "object") return false;
  if (!d.module5 || typeof d.module5 !== "object") return false;

  return true;
}
