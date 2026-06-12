# 🏠 租房风险分析师

AI 驱动的房源风险评估工具，帮你在租房前识别风险、避免踩坑。

## 功能

- 📷 **房源图片分析** — 识别网图、过度美化、信息缺失
- 🔍 **真实性判断** — 判断房东直租 / 中介 / 品牌公寓
- 💰 **价格分析** — 基于城市和价格判断合理性
- ⚠️ **避坑建议** — 列出中介费、合同、押金等风险点
- ❓ **提问建议** — 生成优先级排序的向房东提问清单

## 快速开始

### 1. 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_MODEL=deepseek-chat
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000

### 4. 生产构建

```bash
npm run build
npm start
```

## 技术栈

- **前端**: Next.js + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **AI**: OpenAI 兼容 API（默认 DeepSeek）

## 项目结构

```
app/
├── api/analyze/route.ts    # 唯一后端接口
├── components/
│   ├── InputForm.tsx        # 输入表单
│   ├── ImageUpload.tsx      # 图片上传组件
│   ├── ReportView.tsx       # 报告页总容器
│   ├── RiskScoreCard.tsx    # 综合风险评分卡片
│   ├── ModuleCard.tsx       # 通用模块卡片
│   └── LoadingOverlay.tsx   # 加载状态
├── lib/
│   ├── types.ts             # TypeScript 类型定义
│   ├── prompts.ts           # LLM Prompt 模板
│   └── utils.ts             # 工具函数
├── globals.css
├── layout.tsx
└── page.tsx                 # 主页面（状态切换）
```

## 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `OPENAI_API_KEY` | API 密钥 | `sk-xxx` |
| `OPENAI_BASE_URL` | API 地址 | `https://api.deepseek.com` |
| `OPENAI_MODEL` | 模型名称 | `deepseek-chat` |

## 免责声明

分析结果由 AI 生成，仅供参考，不构成法律或投资建议。租房决策请结合实际情况综合判断。
