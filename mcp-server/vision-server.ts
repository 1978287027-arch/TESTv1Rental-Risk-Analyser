// ============================================================
// MCP Vision Server — 本地图像识别服务
// 启动后在 Claude Code 中配置此服务即可识图
// 模型: qwen3-vl-32b-instruct (阿里 DashScope)
// ============================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import OpenAI from "openai";

// ---------- 配置 ----------
const VISION_API_KEY = process.env.VISION_API_KEY || "sk-5bd5fe16c01b40d2bc24e70efa872cb2";
const VISION_BASE_URL = process.env.VISION_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
const VISION_MODEL = process.env.VISION_MODEL || "qwen3-vl-32b-instruct";

const client = new OpenAI({
  apiKey: VISION_API_KEY,
  baseURL: VISION_BASE_URL,
});

// ---------- Server ----------
const server = new McpServer({
  name: "vision-server",
  version: "1.0.0",
});

// Tool 1: 图片内容描述
server.tool(
  "describe_images",
  "识别房源图片内容：判断房间类型、装修水平、采光、是否有明显问题",
  {
    images: z.array(z.string()).describe("Base64 编码的图片数组（含 data:image/... 前缀）"),
  },
  async ({ images }) => {
    try {
      const contentParts: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
        {
          type: "text",
          text: `请逐一描述这 ${images.length} 张房源图片的内容。对每张图片说明：
1. 这是哪个房间/区域（客厅、厨房、卫生间、主卧、次卧、阳台等）
2. 装修水平（简装/精装/豪华）
3. 采光和空间感受
4. 是否有明显问题（发霉、墙体开裂、管道外露、空间狭小等）
5. 是否像真实拍摄（而非效果图/样板间）

请用中文，按"图1：..."格式输出。`,
        },
      ];

      for (const img of images) {
        contentParts.push({
          type: "image_url",
          image_url: { url: img },
        });
      }

      const response = await client.chat.completions.create({
        model: VISION_MODEL,
        messages: [{ role: "user", content: contentParts }],
        max_tokens: 2048,
      });

      const text = response.choices[0]?.message?.content || "识别失败";
      return {
        content: [{ type: "text", text }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "未知错误";
      return {
        content: [{ type: "text", text: `视觉识别失败: ${msg}` }],
        isError: true,
      };
    }
  },
);

// Tool 2: 从图片提取文字 (OCR)
server.tool(
  "ocr_extract",
  "从图片中提取文字内容（用于识别合同、收据、聊天截图等）",
  {
    image: z.string().describe("Base64 编码的单张图片"),
  },
  async ({ image }) => {
    try {
      const response = await client.chat.completions.create({
        model: VISION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "请提取这张图片中的所有文字，保持原始格式。" },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        max_tokens: 2048,
      });

      const text = response.choices[0]?.message?.content || "识别失败";
      return {
        content: [{ type: "text", text }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "未知错误";
      return {
        content: [{ type: "text", text: `OCR 失败: ${msg}` }],
        isError: true,
      };
    }
  },
);

// ---------- 启动 ----------
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Vision MCP Server started (qwen3-vl-32b-instruct)");
