# KirinGo - 麒麟招聘 🚀
### AI 赋能的温润极简智能招聘平台

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![Vue 3.5](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.0-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind 4](https://img.shields.io/badge/CSS-Tailwind_4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/Lang-TypeScript-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 🌟 项目愿景

**KirinGo** (麒麟招聘) 不仅仅是一个招聘工具，它是一个"懂你"的求职助手。通过 AI 深度介入求职的每一个环节（简历优化、智能匹配、模拟面试、即时沟通），旨在打破信息不对称，让优质人才与卓越企业高效连接。

我们推崇 **温润极简主义 (Warm Minimalist)** 设计哲学，让求职不再焦虑，而是一种愉悦的职场跃迁体验。

---

## 📸 项目预览

<div align="center">
  <img src="./src/assets/hero.png" alt="KirinGo 首页预览" width="800"/>
  <p><em>温润极简的首页设计，双角色入口</em></p>
</div>

---

## ✨ 核心功能详解

### 🧠 AI 智能能力矩阵

| AI 功能 | 详细描述 | 入口位置 | 技术实现 | 部署位置 |
|---------|----------|----------|----------|----------|
| **AI 简历优化** | 根据目标职位要求，智能扫描简历，提供**结构完整性、技能匹配度、关键词覆盖率、语言表达**四个维度打分，并给出具体改进建议，直接在网页中润色改写简历内容 | 求职者 → 我的简历 → 编辑简历 → AI 优化 | Edge Function (`optimizeResume`) + GPT-4 | Supabase Edge Functions |
| **AI 模拟面试** | 针对目标职位，AI 面试官会逐步提出专业问题，支持**实时流式文字输出**，面试结束后从**技术能力、项目经验、表达能力、简历匹配**四个维度给出评估报告和改进方向 | 求职者 → AI 模拟面试 | 前端直连 + Server-Sent Events 流式输出 | 前端直连 DeepSeek/ChatAnywhere |
| **AI 简历解析** | 上传 PDF 简历后，AI 自动提取**个人信息、教育经历、工作经验、项目经历、技能证书**，结构化存入数据库，支持用户二次编辑 | 求职者 → 新建简历 → 上传 PDF | Edge Function (`parseResume`) + GPT-4 | Supabase Edge Functions |
| **AI 职位解析** | 招聘者输入职位描述后，AI 自动提取职位要求、工作职责、技能标签，生成职位嵌入向量用于语义搜索 | 招聘者 → 发布职位 → AI 解析 | Edge Function (`parseJob`) + GPT-4 + Embedding | Supabase Edge Functions |
| **AI 职位匹配** | 基于简历生成语义嵌入向量，通过 pgvector 进行**余弦相似度搜索**，找到与求职者最匹配的开放职位，并给出 AI 匹配分析报告 | 求职者 → 职位匹配 | PostgreSQL pgvector + 余弦相似度 + Edge Function (`matchResumeJob`) | 数据库 + Supabase Edge Functions |
| **AI 聊天助手** | 在聊天窗口中，AI 根据当前对话上下文，提供专业的回复建议，帮助求职者更得体地与 HR 沟通 | 聊天 → 左下角 AI 按钮 | Edge Function (`generateChatMessage`) + GPT-4 | Supabase Edge Functions |

### 💼 求职者端功能

- **简历管理**
  - 支持创建多份不同方向的简历
  - 表单化分步编辑，结构化存储
  - 支持 PDF 上传一键解析
  - AI 优化打分，实时润色
  - 可设置默认简历，投递时快速选择

- **职位浏览与搜索**
  - 卡片流展示开放职位
  - 支持按城市、薪资范围、工作经验、学历筛选
  - 支持按技能标签筛选
  - 支持关键词全文搜索

- **AI 智能匹配**
  - 基于简历语义向量，一键推荐最匹配的职位
  - 展示匹配度分数和详细分析
  - 直接一键投递推荐职位

- **AI 模拟面试**
  - 选择目标职位，开始全真模拟面试
  - AI 流式提问，用户实时回答
  - 面试结束生成完整评估报告
  - 历史面试记录保存，可随时回顾

- **投递跟踪**
  - 查看所有投递记录
  - 实时显示申请状态（待审核 / 已阅 / 面试邀请 / Offer / 拒绝 / 已撤回）
  - 点击直接进入与招聘者聊天窗口

- **即时通讯**
  - 与招聘者实时沟通
  - 支持文本消息
  - 显示已读/未读状态
  - 未读消息计数
  - AI 辅助回复建议

- **个人资料**
  - 编辑个人基本信息
  - 上传头像
  - 一键切换角色（求职者 ↔ 招聘者）

### 👔 招聘者端功能

- **企业管理**
  - 创建完善企业信息
  - 上传企业 Logo
  - 填写行业、规模、融资阶段、地址、企业介绍

- **职位管理**
  - 发布新职位
  - AI 辅助解析职位描述，自动提取标签和要求
  - 编辑/关闭/重新开放职位
  - 查看职位浏览量

- **求职者匹配**
  - 基于职位需求，AI 自动推荐匹配度最高的求职者简历
  - 按匹配度排序，优先查看最合适的候选人

- **申请管理**
  - 查看收到的所有申请
  - 按状态筛选（待查看/已阅/面试/Offer/拒绝）
  - 一键查看求职者完整简历
  - 更新申请状态，系统自动通知求职者

- **即时通讯**
  - 与求职者实时沟通
  - 基于申请直接创建对话
  - 已读状态 + 未读计数
  - AI 辅助回复

---

### 🎨 设计系统：温润极简主义 (Warm Minimalist)

完整设计规范请参见 [DESIGN.md](./DESIGN.md)

**设计原则细节：**

| 设计元素 | 规范细节 |
|----------|----------|
| **背景色** | `#f2f1ed` - 暖奶油色，比纯白更柔和，长时间浏览不累眼 |
| **文本色** | `#26251e` - 暖炭黑，不是纯黑，冷暖更协调 |
| **主强调色** | `#f54e00` - 品牌橘红色，温暖活力 |
| **错误色** | `#cf2d56` - 绯红色，用于错误和提示 |
| **边框** | 使用 `oklab()` 色彩空间，`oklch(0.90% 0.03 70)`，感知均匀的暖灰色边框 |
| **阴影** | 大模糊值：Card 阴影 `0 28px 70px oklch(0.30% 0.02 70 / 0.15)`，弥散大气氛 |
| **间距** | 基准单位 `8px`，支持亚 8px 微调整：`1.5px` `2px` `2.5px` `4px` |
| **圆角** | 卡片/按钮 `8px`，标签/徽章 `9999px`（全圆角） |
| **悬停交互** | 所有可点击文字/卡片，悬停时文字颜色渐变到品牌色 `#f54e00`，这是项目标志性交互语言 |
| **过渡** | 所有过渡使用 `0.2s ease-out`，快但不突兀 |

---

## 🗂️ 项目结构详解

```
KirinGo/
├── src/
│   ├── components/               # 可复用 Vue 组件 (PascalCase 命名)
│   │   ├── AppHeader.vue         # 顶部导航栏
│   │   ├── AppSidebar.vue        # 侧边栏（移动端抽屉）
│   │   ├── AuthGuard.vue         # 路由认证守卫包装器
│   │   ├── AvatarUpload.vue      # 头像上传组件
│   │   ├── Badge.vue             # 标签徽章组件
│   │   ├── Button.vue            # 基础按钮组件
│   │   ├── Card.vue              # 基础卡片容器
│   │   ├── ChatMessage.vue       # 聊天消息单元
│   │   ├── Input.vue             # 基础输入框组件
│   │   ├── JobCard.vue           # 职位卡片
│   │   ├── Modal.vue             # 弹窗模态框
│   │   ├── Pagination.vue        # 分页组件
│   │   ├── RoleSwitch.vue        # 角色切换组件
│   │   ├── Select.vue            # 下拉选择组件
│   │   ├── StatusTag.vue         # 状态标签（应用状态等）
│   │   └── TextArea.vue          # 多行文本输入组件
│   │
│   ├── pages/                    # 页面组件，按路由组织
│   │   ├── Home.vue              # 首页
│   │   ├── Login.vue             # 登录/注册页
│   │   ├── jobseeker/            # 求职者端页面
│   │   │   ├── Dashboard.vue     # 求职者首页
│   │   │   ├── ResumeList.vue    # 简历列表
│   │   │   ├── ResumeEdit.vue    # 简历编辑
│   │   │   ├── JobList.vue       # 职位列表
│   │   │   ├── JobDetail.vue     # 职位详情
│   │   │   ├── MatchList.vue     # AI 推荐匹配列表
│   │   │   ├── InterviewList.vue # 模拟面试历史
│   │   │   ├── InterviewRoom.vue # 面试房间
│   │   │   ├── Applications.vue  # 我的投递
│   │   │   └── Profile.vue       # 个人资料
│   │   ├── recruiter/            # 招聘者端页面
│   │   │   ├── Dashboard.vue     # 招聘者首页
│   │   │   ├── CompanyEdit.vue   # 企业信息编辑
│   │   │   ├── JobList.vue       # 我的职位
│   │   │   ├── JobEdit.vue       # 发布/编辑职位
│   │   │   ├── Applications.vue  # 申请列表
│   │   │   ├── ApplicationDetail.vue # 申请详情
│   │   │   └── Profile.vue       # 招聘者资料
│   │   └── chat/
│   │       └── ChatRoom.vue      # 聊天室
│   │
│   ├── composables/               # Composition API 工具函数
│   │   ├── useDarkMode.ts        # 暗黑模式（预留）
│   │   ├── useDebounce.ts        # 防抖工具
│   │   ├── useIntersectionObserver.ts # 无限滚动观察器
│   │   ├── useLoading.ts         # 加载状态管理
│   │   ├── useModal.ts           # 弹窗状态管理
│   │   ├── useRealtime.ts        # Supabase 实时订阅封装
│   │   ├── useToast.ts           # 消息提示 Toast
│   │   └── useWindowSize.ts      # 窗口尺寸监听
│   │
│   ├── stores/                   # Pinia 状态存储 (Setup 风格)
│   │   ├── auth.ts               # 认证与用户状态
│   │   ├── chat.ts               # 聊天状态
│   │   └── role.ts               # 当前角色状态（求职者/招聘者）
│   │
│   ├── lib/                      # 库和抽象层
│   │   ├── database.ts           # 数据库操作封装
│   │   ├── supabase.ts           # Supabase 客户端初始化
│   │   └── llmStream.ts          # LLM 流式响应处理（用于模拟面试）
│   │
│   ├── router/
│   │   └── index.ts              # Vue Router 路由配置
│   │
│   ├── types/
│   │   └── index.ts              # 全局 TypeScript 类型定义
│   │
│   ├── assets/
│   │   └── hero.png              # Hero 图
│   │
│   ├── style.css                 # 全局样式 + Tailwind 主题定义
│   └── main.ts                   # 应用入口
│
├── supabase/
│   └── functions/                # Supabase Edge Functions (Deno)
│       ├── optimizeResume/
│       │   └── index.ts          # AI 简历优化打分
│       ├── matchResumeJob/
│       │   └── index.ts          # AI 简历职位匹配评分
│       ├── interviewAI/
│       │   └── index.ts          # AI 模拟面试（备用，当前前端直连）
│       ├── parseResume/
│       │   └── index.ts          # AI 简历解析
│       ├── parseJob/
│       │   └── index.ts          # AI 职位解析
│       └── generateChatMessage/
│           └── index.ts          # AI 聊天回复生成
│
├── public/                       # 静态资源
├── dist/                         # 生产构建输出
├── DESIGN.md                     # 完整设计规范文档
├── CLAUDE.md                     # Claude Code 开发指南
├── supabase/schema.sql           # 完整数据库表结构 + RLS 策略
├── vercel.json                   # Vercel 部署配置
├── tsconfig.json                 # TypeScript 主配置
├── tsconfig.app.json             # TypeScript 应用配置
├── vite.config.ts                # Vite 配置
├── package.json                  # NPM 依赖
└── README.md                     # 本文件
```

---

## 🐘 数据库架构详解

项目使用 Supabase PostgreSQL，所有表都启用**行级安全 (RLS)**，确保数据安全。

### 表结构总览

| 表名 | 描述 | 主键 | 关联 | RLS 策略 |
|------|------|------|------|----------|
| `profiles` | 用户资料表，扩展 `auth.users` | `id` (UUID) ← `auth.users.id` | 1:1 关联 Auth | 所有人可读，只能修改自己 |
| `companies` | 企业信息 | `id` (UUID) | `recruiter_id` → `profiles.id` | 所有人可读，招聘者只能管理自己的企业 |
| `jobs` | 职位信息 | `id` (UUID) | `recruiter_id`, `company_id` | 公开职位所有人可读，招聘者管理自己的 |
| `resumes` | 结构化简历 | `id` (UUID) | `user_id` → `profiles.id` | 用户只能管理自己的，招聘者能查看投递给自己的 |
| `applications` | 职位申请记录 | `id` (UUID) | `job_id`, `user_id`, `recruiter_id`, `resume_id` | 求职者看自己的，招聘者看收到的，都能更新 |
| `conversations` | 聊天会话 | `id` (UUID) | `jobseeker_id`, `recruiter_id`, `job_id` | 只有会话参与者可访问 |
| `messages` | 聊天消息 | `id` (UUID) | `conversation_id`, `sender_id` | 只有会话参与者可访问 |
| `interviews` | AI 模拟面试记录 | `id` (UUID) | `user_id`, `job_id` | 用户只能管理自己的 |

### 向量搜索

项目使用 `pgvector` 扩展存储 1536 维嵌入向量：
- `jobs.embedding` - 职位描述的嵌入向量
- `resumes.embedding` - 简历的嵌入向量
- 提供 `match_jobs()` 存储函数，基于余弦相似度返回最匹配的职位

### 存储桶 (Storage)

| 存储桶 | 公开性 | 用途 | RLS 策略 |
|--------|--------|------|----------|
| `resumes` | 私有 | 存储上传的 PDF 简历 | 用户只能访问自己的简历 |
| `avatars` | 公开 | 存储用户头像 | 任何人可读写自己的头像 |

### 实时推送 (Realtime)

启用了以下表的实时广播：
- `messages` - 聊天消息实时推送
- `conversations` - 会话状态更新

完整 SQL 请参见 [supabase/schema.sql](./supabase/schema.sql)

---

## 🛠️ 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | Vue | 3.5 | Composition API + `<script setup>` 语法 |
| 状态管理 | Pinia | latest | 函数式 Setup Store 风格 |
| 构建工具 | Vite | 8.x | 极速开发体验 |
| 语言 | TypeScript | 6.x | 类型安全 |
| 样式 | Tailwind CSS | 4.x | 原子化 CSS |
| 图标 | Lucide Vue | latest | 简洁开源图标 |
| 路由 | Vue Router | 4.x | 客户端路由 |
| 后端 | Supabase | - | PostgreSQL + Auth + Storage + Realtime + Edge Functions |
| 向量搜索 | pgvector | latest | PostgreSQL 向量扩展 |
| AI 大模型 | OpenAI GPT-4 / DeepSeek | - | 语义理解与生成 |
| 部署 | Vercel + Supabase | - | 前端 Vercel，后端 Supabase |

---

## 🚀 从零搭建详细步骤

### 前置要求

- Node.js 18.0 或更高版本
- Supabase 账号（免费版可运行完整功能）
- OpenAI API Key（用于 Edge Functions）
- DeepSeek / ChatAnywhere API Key（用于 AI 模拟面试，可选，也可使用 OpenAI）

### 1. 克隆代码

```bash
git clone https://github.com/hackdeacon/KirinGo.git
cd KirinGo
npm install
```

### 2. 创建 Supabase 项目

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 点击 "New project"
3. 选择组织、名称、密码、区域，创建项目
4. 等待项目初始化完成（约 2-3 分钟）

### 3. 配置数据库

进入 Supabase → SQL Editor，执行以下操作：

**第一步：启用扩展**
```sql
create extension vector;
create extension "uuid-ossp";
```

**第二步：导入完整表结构**
复制并执行 [supabase/schema.sql](./supabase/schema.sql) 文件中的全部内容。

执行完成后，你应该能看到：
- 所有 8 张表已创建
- 所有 RLS 策略已创建
- `profiles` 触发器已创建（新用户注册自动创建资料）
- 向量匹配函数 `match_jobs()` 已创建
- 两个存储桶 `resumes` 和 `avatars` 已创建
- Realtime 已启用

**验证：** 在 Table Editor 中应该能看到所有表。

### 4. 配置认证 (Auth)

1. 进入 Supabase → Authentication → Providers
2. 确保 "Email" 提供者已启用
3. 开启 "Confirm email" （可选，关闭可无需验证直接注册）
4. 如果你需要第三方登录（Google、Github 等），可另行配置

5. **配置网站 URL**
   - 进入 Authentication → URL Configuration
   - Site URL: `http://localhost:3000`（开发环境）
   - 生产环境填写你的 Vercel 域名
   - 在 "Redirect URLs" 添加：
     - `http://localhost:3000/*`
     - `https://你的域名.vercel.app/*`

### 5. 配置 Storage CORS

如果遇到头像无法上传问题：
1. 进入 Storage → Settings
2. 在 CORS 配置中添加：
   ```
   http://localhost:3000
   https://你的域名.vercel.app
   ```

### 6. 获取项目密钥

在 Supabase → Settings → API：
- 复制 `Project URL` → 这是你的 `VITE_SUPABASE_URL`
- 复制 `anon public` 密钥 → 这是你的 `VITE_SUPABASE_ANON_KEY`

### 7. 本地环境变量配置

在项目根目录创建 `.env` 文件：

```env
# ========== Supabase 配置（必填）==========
VITE_SUPABASE_URL=https://你的项目-id.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon-public-密钥

# ========== AI 模拟面试配置（必填，推荐）==========
# 优先级: VITE_INTERVIEW_API_KEY > VITE_CHATANYWHERE_API_KEY > VITE_DEEPSEEK_API_KEY
VITE_INTERVIEW_API_KEY=你的ChatAnywhereAPIKey
VITE_INTERVIEW_API_BASE_URL=https://api.chatanywhere.tech/v1
VITE_INTERVIEW_MODEL=gpt-4o-mini

# 备选方案 1: DeepSeek 直接配置
# VITE_DEEPSEEK_API_KEY=你的DeepSeekKey
# VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
# VITE_DEEPSEEK_MODEL=deepseek-chat

# 备选方案 2: OpenAI 配置
# VITE_DEEPSEEK_API_KEY=你的OpenAIKey
# VITE_DEEPSEEK_BASE_URL=https://api.openai.com/v1
# VITE_DEEPSEEK_MODEL=gpt-4o-mini
```

完整环境变量说明：

| 变量名 | 必须 | 说明 |
|--------|:----:|------|
| `VITE_SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名公钥 |
| `VITE_INTERVIEW_API_KEY` | ✅* | AI 模拟面试 API Key，优先级最高 |
| `VITE_INTERVIEW_API_BASE_URL` | ✅* | AI 模拟面试 API 地址 |
| `VITE_INTERVIEW_MODEL` | ✅* | AI 模拟面试模型名 |
| `VITE_CHATANYWHERE_API_KEY` | - | ChatAnywhere 备用密钥 |
| `VITE_DEEPSEEK_API_KEY` | - | DeepSeek 备用密钥 |
| `VITE_DEEPSEEK_BASE_URL` | - | DeepSeek API 地址 |
| `VITE_DEEPSEEK_MODEL` | - | DeepSeek 模型名 |

> *: 只要配置了其中一组即可使用 AI 模拟面试功能

### 8. 本地启动开发

```bash
npm run dev
```

打开浏览器访问 `http://localhost:3000`，你应该能看到首页。尝试注册账号，如果能正常登录进入首页，说明配置成功。

### 9. 部署 Edge Functions

> ⚠️ 这一步是必须的，因为 AI 简历优化、解析、匹配都需要 Edge Functions。

首先安装 [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
# macOS
brew install supabase/tap/supabase

# 其他系统查看 https://supabase.com/docs/guides/cli/installation
```

登录 Supabase：

```bash
supabase login
```

设置 OpenAI API Key 为全局密钥（所有 Edge Functions 共享）：

```bash
supabase secrets set OPENAI_API_KEY=your-openai-api-key --project-ref your-project-ref
```

> 项目 ref 可以在 Supabase Settings → General → Project ID 找到。

部署所有 Edge Functions：

```bash
supabase functions deploy
```

这会自动部署以下 6 个函数：
- `optimizeResume`
- `matchResumeJob`
- `interviewAI`
- `parseResume`
- `parseJob`
- `generateChatMessage`

部署完成后，在 Supabase Dashboard → Edge Functions 可以看到所有函数。

**开发测试单个函数：**
```bash
supabase functions serve optimizeResume --env-file .env
```

### 10. 生产部署到 Vercel

**方法一：通过 Vercel Git 集成（推荐）**

1. 将代码推送到你的 GitHub
2. 登录 [Vercel Dashboard](https://vercel.com/)
3. 点击 "New Project" → Import 你的 GitHub 仓库
4. 在 "Environment Variables" 中，添加所有 `.env` 中的变量
5. 点击 "Deploy"
6. 等待构建完成 → 访问你的域名 → 完成 ✅

项目已包含 `vercel.json`，自动配置了 Vue Router 历史模式的回退规则，无需额外配置。

**方法二：通过 Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel
```

按提示操作即可。

---

## 📝 角色权限说明

### 求职者 (`jobseeker`)
- ✅ 创建/编辑/删除自己的简历
- ✅ 浏览所有公开职位
- ✅ 搜索和筛选职位
- ✅ 查看职位详情
- ✅ AI 匹配推荐
- ✅ AI 模拟面试
- ✅ 投递职位
- ✅ 查看自己的投递状态
- ✅ 与招聘者聊天
- ✅ 编辑个人资料
- ✅ 可以切换到招聘者角色

### 招聘者 (`recruiter`)
- ✅ 创建/编辑企业信息
- ✅ 发布/编辑/关闭职位
- ✅ 查看收到的申请
- ✅ 查看投过来的简历
- ✅ 更新申请状态
- ✅ 与求职者聊天
- ✅ 编辑个人资料
- ✅ 可以切换到求职者角色

**切换角色**：点击右上角头像 → 切换角色，即可在两种角色间切换，一份账号同时拥有两种身份。

---

## 🔒 安全性

- 所有表都启用了行级安全 (RLS)，用户只能访问自己有权限的数据
- Edge Functions 验证 Supabase JWT 后才处理请求
- 存储桶有严格的访问控制
- 敏感的 API Key（OpenAI）只存在于 Edge Functions 环境，不暴露给前端
- 前端只使用 Supabase 匿名密钥，所有敏感操作由 Edge Functions 处理

---

## ❓ 常见问题 FAQ

**Q: 可以不用 Supabase 吗？**
A: 不行，项目深度整合了 Supabase 的 Auth、Database、Storage、Realtime、Edge Functions，换其他后端需要大量重构。

**Q: 免费版 Supabase 可以运行吗？**
A: 完全可以，免费版的配额足够个人开发和小流量使用。

**Q: AI 模拟面试一定要 ChatAnywhere 吗？**
A: 不需要，支持 ChatAnywhere / DeepSeek / OpenAI，配置其中一个就行，优先级按代码中的来。

**Q: 为什么 AI 模拟面试是前端直连而不是走 Edge Function？**
A: 前端直连可以减少中转，流式响应更流畅，也节省 Edge Function 执行时间。

**Q: 邮箱验证不能通过，注册不了怎么办？**
A: 在 Supabase Authentication → Providers → Email，关掉 "Confirm email" 即可。

**Q: 上传头像报错 CORS 怎么办？**
A: 参考上文 "配置 Storage CORS" 部分，添加你的域名到 Supabase Storage CORS 配置。

**Q: pgvector 扩展怎么开？**
A: 免费版 Supabase 也支持，进入 SQL Editor 执行 `create extension vector;` 即可。

---

## 🧑‍💻 开发指南

### 代码规范

- 组件文件命名：`PascalCase.vue`，例如 `JobCard.vue`
- 工具文件命名：`camelCase.ts`，例如 `useToast.ts`
- 所有全局类型在 `src/types/index.ts` 导出
- Pinia Store 使用函数式 Setup 风格
- UI 文本和注释优先使用中文
- 路由采用代码分割，动态导入页面
- 数据库操作统一通过 `src/lib/database.ts` 封装

### 添加新页面

1. 在 `src/pages/` 对应角色目录下创建 `.vue` 文件
2. 在 `src/router/index.ts` 添加路由记录
3. 如果需要在菜单显示，在 `AppSidebar.vue` 添加菜单项

### 添加新的 Edge Function

```bash
supabase functions new myFunction
```

在 `supabase/functions/myFunction/index.ts` 开发，然后：

```bash
supabase functions deploy myFunction
```

### 调试

浏览器打开 `http://localhost:3000`，打开 DevTools Console 查看日志。

---

## 🤝 贡献

欢迎贡献代码！流程：

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/你的功能名称`
3. 提交改动：`git commit -m 'Add: 某某功能'`
4. 推送到分支：`git push origin feature/你的功能名称`
5. 创建 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

---

## 🌟 Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=hackdeacon/KirinGo&type=Date)](https://star-history.com/#hackdeacon/KirinGo&Date)

---

## 👨‍💻 作者

**KirinGo** 由 [hackdeacon](https://github.com/hackdeacon) 设计并开发。

如果你喜欢这个项目，欢迎点个 Star ⭐️

---

**Generated with ❤️ by Claude Code**
