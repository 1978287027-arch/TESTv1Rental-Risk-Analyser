// ============================================================
// POST /api/analyze — 房源风险分析接口
// 含 Vision Bridge：自动用视觉模型识别图片，再传给 DeepSeek 分析
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/app/lib/prompts";
import { validateRequest, isValidAnalysisResult, ANALYZE_TIMEOUT } from "@/app/lib/utils";

/** 调用视觉模型识别图片内容 */
async function describeImages(
  images: string[],
): Promise<string | null> {
  const visionApiKey = process.env.VISION_API_KEY;
  const visionBaseURL = process.env.VISION_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
  const visionModel = process.env.VISION_MODEL || "qwen3-vl-32b-instruct";

  if (!visionApiKey) {
    console.log("VISION_API_KEY not configured, skipping image recognition");
    return null;
  }

  const client = new OpenAI({
    apiKey: visionApiKey,
    baseURL: visionBaseURL,
  });

  try {
    const contentParts: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: `请逐一描述这 ${images.length} 张房源图片的内容。对于每张图片，请说明：
1. 这是哪个房间/区域（如：客厅、厨房、卫生间、主卧、次卧、阳台、走廊等）
2. 房间的装修水平（简装/精装/豪华）
3. 采光和空间感受
4. 是否有明显问题（如：发霉、墙体开裂、管道外露、空间狭小等）
5. 是否看起来像真实拍摄（而非效果图/样板间）

请用中文描述，按"图1：...图2：..."的格式输出。`,
      },
    ];

    // 添加图片
    for (const img of images) {
      contentParts.push({
        type: "image_url",
        image_url: { url: img },
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await client.chat.completions.create(
      {
        model: visionModel,
        messages: [{ role: "user", content: contentParts }],
        max_tokens: 2048,
      },
      { signal: controller.signal },
    );

    clearTimeout(timeoutId);
    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("Vision model error:", error);
    return null; // 视觉识别失败不影响主流程
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "请求体解析失败" }, { status: 400 });
    }

    // 2. 参数校验
    const validationError = validateRequest(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { images = [], description, price, city } = body;

    // 3. 初始化 DeepSeek 客户端
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || "https://api.deepseek.com";
    const model = process.env.OPENAI_MODEL || "deepseek-chat";

    if (!apiKey) {
      return NextResponse.json(
        { error: "服务未配置 API Key，请联系管理员" },
        { status: 500 },
      );
    }

    // 4. Vision Bridge：用视觉模型识别图片 → 文本描述
    let imageDescription: string | null = null;
    if (images.length > 0) {
      imageDescription = await describeImages(images);
    }

    // 5. 构造 User Prompt（含图片识别结果）
    const userMessage = buildUserPrompt(
      description,
      price,
      city,
      images.length,
      imageDescription,
    );

    const client = new OpenAI({ apiKey, baseURL });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ];

    // 6. 调用 DeepSeek 分析
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT);

    try {
      const response = await client.chat.completions.create(
        {
          model,
          messages,
          temperature: 0.3,
          max_tokens: 4096,
          response_format: { type: "json_object" },
        },
        { signal: controller.signal },
      );

      clearTimeout(timeoutId);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return NextResponse.json(
          { error: "AI 未返回有效内容，请重试" },
          { status: 500 },
        );
      }

      // 7. 解析 LLM 返回的 JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch {
            return NextResponse.json(
              { error: "AI 返回格式异常，请重试" },
              { status: 500 },
            );
          }
        } else {
          return NextResponse.json(
            { error: "AI 返回格式异常，请重试" },
            { status: 500 },
          );
        }
      }

      // 8. 验证结果结构
      if (!isValidAnalysisResult(parsed)) {
        console.error("Invalid result structure:", JSON.stringify(parsed, null, 2));
        return NextResponse.json(
          { error: "AI 返回数据结构异常，请重试" },
          { status: 500 },
        );
      }

      return NextResponse.json(parsed);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json(
          { error: "分析超时，请重试" },
          { status: 504 },
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "未知错误";
    return NextResponse.json(
      { error: `分析失败：${message}` },
      { status: 500 },
    );
  }
}
