# KirinGo - 麒麟智聘 🚀
### AI 赋能的温润极简智能招聘平台

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![Vue 3.5](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.0-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind 4](https://img.shields.io/badge/CSS-Tailwind_4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/Lang-TypeScript-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 🌟 项目愿景

**KirinGo** (麒麟智聘) 不仅仅是一个招聘工具，它是一个"懂你"的求职助手。通过 AI 深度介入求职的每一个环节（简历优化、智能匹配、模拟面试、即时沟通），旨在打破信息不对称，让优质人才与卓越企业高效连接。

我们推崇 **温润极简主义 (Warm Minimalist)** 设计哲学，让求职不再焦虑，而是一种愉悦的职场跃迁体验。

---

## 🌐 在线演示

**演示地址**: [https://kiringo.vercel.app](https://kiringo.vercel.app)

> 注：演示环境数据会定期重置，仅供体验功能使用。

---

## 📸 项目预览

<div align="center">
  <img src="https://pic.hackstory.cn/hero/image.webp" alt="KirinGo 麒麟智聘 首页预览" width="800"/>
  <p><em>温润极简的首页设计，双角色入口</em></p>
</div>

---

## ✨ 核心功能详解

### 🧠 AI 智能能力矩阵

| AI 功能 | 详细描述 | 入口位置 | 技术实现 | 部署位置 |
|---------|----------|----------|----------|----------|
| **AI 简历优化** | 根据目标职位要求，智能扫描简历，提供**结构完整性、技能匹配度、关键词覆盖率、语言表达**四个维度打分，并给出具体改进建议，直接在网页中润色改写简历内容 | 求职者 → 我的简历 → 编辑简历 → AI 优化 | Edge Function (`optimizeResume`) + GPT-4 函数调用 | Supabase Edge Functions |
| **AI 模拟面试** | 针对目标职位，AI 面试官会逐步提出专业问题，支持**实时流式文字输出**，面试结束后从**技术能力、项目经验、表达能力、简历匹配**四个维度给出评估报告和改进方向 | 求职者 → AI 模拟面试 | 前端直连 + Server-Sent Events 流式输出，自定义 buffer 处理 | 前端直连 DeepSeek/ChatAnywhere/OpenAI |
| **AI 简历解析** | 上传 PDF 简历后，AI 自动提取**个人信息、教育经历、工作经验、项目经历、技能证书**，结构化存入数据库，支持用户二次编辑 | 求职者 → 新建简历 → 上传 PDF | Edge Function (`parseResume`) + GPT-4 JSON 模式 | Supabase Edge Functions |
| **AI 职位解析** | 招聘者输入职位描述后，AI 自动提取职位要求、工作职责、技能标签，生成职位嵌入向量用于语义搜索 | 招聘者 → 发布职位 → AI 解析 | Edge Function (`parseJob`) + GPT-4 + OpenAI Embedding | Supabase Edge Functions |
| **AI 职位匹配** | 基于简历生成语义嵌入向量，通过 pgvector 进行**余弦相似度搜索**，找到与求职者最匹配的开放职位，并给出 AI 匹配分析报告 | 求职者 → 职位匹配 | PostgreSQL pgvector + 余弦相似度 + Edge Function (`matchResumeJob`) | 数据库 + Supabase Edge Functions |
| **AI 聊天助手** | 在聊天窗口中，AI 根据当前对话上下文，提供专业的回复建议，帮助求职者更得体地与 HR 沟通 | 聊天 → 左下角 AI 按钮 | Edge Function (`generateChatMessage`) + GPT-4 | Supabase Edge Functions |

### 🧬 AI 匹配算法工作流程

```
求职者简历 → AI 生成 embedding 向量 (1536维) → 存入 resumes.embedding
                ↓
调用 PostgreSQL match_jobs() 函数 → 计算余弦相似度 similarity = 1 - (resume_embedding <=> job_embedding) → 筛选 similarity > 0.5 → 按相似度排序返回前 10
                ↓
Edge Function matchResumeJob → AI 对每个匹配结果进行深度分析 → 输出匹配分数 + 优势 + 劣势 + 建议
                ↓
前端展示匹配排序列表 → 用户可一键投递
```

**相似度计算说明**:
- pgvector 使用 L2 距离：`<=>` 运算符返回 L2 距离，值越小越相似
- 转换为相似度：`1 - L2距离`，范围 `[0, 1]`，值越大越相似
- 默认阈值 `0.5`，低于阈值的结果被过滤

### 💼 求职者端功能

- **简历管理**
  - 支持创建多份不同方向的简历（最多 10 份，限制在前端）
  - 表单化分步编辑，结构化存储（基本信息/教育/经历/技能/项目/证书）
  - 支持 PDF 上传一键解析，自动填充表单
  - AI 四维评分（结构/匹配/关键词/表达），支持实时润色改写
  - 可设置默认简历，投递时自动选中

- **职位浏览与搜索**
  - 响应式卡片流展示开放职位，移动端自动适配单列
  - 支持按城市、薪资范围、工作经验、学历筛选
  - 支持按技能标签多选筛选
  - 支持关键词全文搜索（PostgreSQL 原生全文搜索）
  - 无限滚动加载，使用 IntersectionObserver 实现

- **AI 智能匹配**
  - 基于简历语义向量，一键推荐最匹配的职位
  - 展示匹配度分数（0-100）和详细分析（优势/不足/建议）
  - 直接一键投递推荐职位，跳转到投递确认

- **AI 模拟面试**
  - 可选择任意公开职位开始全真模拟面试
  - AI 流式提问，逐字显示，接近真实对话体验
  - 用户实时回答，AI 继续追问，最多 10 轮对话
  - 面试结束生成完整四维度评估报告
  - 历史面试记录自动保存，可随时回顾对话和评估

- **投递跟踪**
  - 查看所有投递记录，列表展示
  - 实时显示申请状态：
    - `pending` - 待审核
    - `viewed` - 已阅
    - `interview` - 面试邀请
    - `offer` - 已发Offer
    - `rejected` - 不合适
    - `withdrawn` - 已撤回
  - 点击直接进入与招聘者聊天窗口

- **即时通讯**
  - 与招聘者实时双向沟通
  - 支持纯文本消息（可扩展支持图片文件）
  - 显示已读/未读状态，已读消息对勾变绿
  - 会话列表显示未读消息计数
  - 进入聊天后自动清空对应用户的未读计数
  - 左下角 AI 按钮，一键生成回复建议

- **个人资料**
  - 编辑个人基本信息（姓名、电话、城市、简介）
  - 点击头像上传更换头像，自动上传到 Supabase Storage
  - 一键切换角色（求职者 ↔ 招聘者），切换后自动跳转对应首页

### 👔 招聘者端功能

- **企业管理**
  - 创建完善企业信息
  - 上传企业 Logo
  - 填写行业、规模、融资阶段、城市、详细地址、企业介绍、官网

- **职位管理**
  - 发布新职位
  - AI 辅助解析职位描述，自动提取技能标签、要求、经验
  - 编辑/关闭/重新开放职位
  - 职位卡片显示浏览量统计

- **求职者匹配**
  - 基于职位需求，AI 自动推荐匹配度最高的求职者简历
  - 按匹配度从高到低排序，优先查看最合适的候选人

- **牛人搜索**
  - 招聘者可主动在简历库中搜索发掘优秀人才
  - 支持多维度组合筛选：
    - 工作城市模糊搜索
    - 最低学历要求（大专/本科/硕士/博士及以上）
    - 技能关键词模糊搜索（空格分隔多个关键词）
    - 专业关键词模糊搜索
    - 最低 AI 评分筛选
  - 支持按 AI 评分降序或最新发布排序
  - 分页展示，点击直接查看完整简历或发起聊天

- **申请管理**
  - 查看收到的所有申请
  - 按状态筛选（待查看/已阅/面试/Offer/拒绝）
  - 一键查看求职者完整简历
  - 更新申请状态，系统自动触达求职者（未来可支持邮件/推送通知）
  - 点击直接进入与求职者聊天窗口

- **即时通讯**
  - 与求职者实时双向沟通
  - 基于申请自动创建对话，无需手动发起
  - 已读状态 + 未读计数
  - AI 辅助回复，帮助 HR 快速回复

---

### 🎨 设计系统：温润极简主义 (Warm Minimalist)

完整设计规范请参见 [DESIGN.md](./DESIGN.md)

**设计原则细节：**

| 设计元素 | 规范细节 |
|----------|----------|
| **背景色** | `#f2f1ed` - 暖奶油色，比纯白更柔和，长时间浏览不累眼 |
| **文本色** | `#26251e` - 暖炭黑，不是纯黑，冷暖更协调 |
| **主强调色** | `#f54e00` - 品牌橘红色，温暖活力 |
| **错误色** | `#cf2d56` - 绯红色，用于错误提示和表单验证 |
| **边框** | 使用 `oklab()` 色彩空间，`oklch(0.90 0.03 70)`，感知均匀的暖灰色边框 |
| **阴影** | 大模糊值：Card 阴影 `0 28px 70px oklch(0.30 0.02 70 / 0.15)`，弥散大气氛深度 |
| **间距** | 基准单位 `8px`，支持亚 8px 微调整：`1.5px` `2px` `2.5px` `4px` |
| **圆角** | 卡片/按钮 `8px`，标签/徽章 `9999px`（全圆角） |
| **悬停交互** | 所有可点击文字/卡片，悬停时文字颜色渐变到品牌色 `#f54e00`，这是项目标志性交互语言 |
| **过渡** | 所有过渡使用 `0.2s ease-out`，快但不突兀 |
| **字体** | 系统无衬线栈：`ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial` |

---

## 🗺️ 路由表

| 路径 | 页面 | 角色 | 说明 |
|------|------|------|------|
| `/` | Home | 所有人 | 首页，介绍项目 |
| `/login` | Login | 未登录 | 登录注册页 |
| `/jobseeker/dashboard` | Dashboard | 求职者 | 求职者控制台首页 |
| `/jobseeker/resumes` | ResumeList | 求职者 | 简历列表 |
| `/jobseeker/resumes/:id/edit` | ResumeEdit | 求职者 | 简历编辑 |
| `/jobseeker/jobs` | JobList | 求职者 | 职位列表 |
| `/jobseeker/jobs/:id` | JobDetail | 求职者 | 职位详情 |
| `/jobseeker/matches` | MatchList | 求职者 | AI 推荐匹配职位 |
| `/jobseeker/interviews` | InterviewList | 求职者 | 模拟面试历史 |
| `/jobseeker/interviews/:id` | InterviewRoom | 求职者 | 面试房间 |
| `/jobseeker/applications` | Applications | 求职者 | 我的投递 |
| `/jobseeker/profile` | Profile | 求职者 | 个人资料 |
| `/recruiter/dashboard` | Dashboard | 招聘者 | 招聘者控制台首页 |
| `/recruiter/company` | CompanyEdit | 招聘者 | 企业信息编辑 |
| `/recruiter/jobs` | JobList | 招聘者 | 我的职位列表 |
| `/recruiter/jobs/new` | JobEdit | 招聘者 | 发布新职位 |
| `/recruiter/jobs/:id/edit` | JobEdit | 招聘者 | 编辑职位 |
| `/recruiter/applications` | Applications | 招聘者 | 申请列表 |
| `/recruiter/applications/:id` | ApplicationDetail | 招聘者 | 申请详情 |
| `/recruiter/profile` | Profile | 招聘者 | 招聘者资料 |
| `/chat/:id` | ChatRoom | 已登录 | 聊天室 |

所有路由采用**动态导入**实现代码分割：
```typescript
const Home = () => import('../pages/Home.vue')
```

---

## 🗂️ 项目结构详解

```
KirinGo/
├── src/
│   ├── components/               # 可复用 Vue 组件 (PascalCase 命名)
│   │   ├── AppHeader.vue         # 顶部导航栏，包含面包屑、用户菜单
│   │   ├── AppSidebar.vue        # 侧边栏导航，移动端转为抽屉弹窗
│   │   ├── AuthGuard.vue         # 路由认证守卫包装器，未登录跳登录
│   │   ├── AvatarUpload.vue      # 头像上传组件，支持裁剪预览
│   │   ├── Badge.vue             # 标签徽章基础组件
│   │   ├── Button.vue            # 基础按钮组件，支持 variant/size/disabled
│   │   ├── Card.vue              # 基础卡片容器，统一内边距阴影
│   │   ├── ChatMessage.vue       # 聊天消息单元，区分自己/对方样式
│   │   ├── Input.vue             # 基础输入框组件，统一样式
│   │   ├── JobCard.vue           # 职位卡片，显示职位基本信息
│   │   ├── Modal.vue             # 弹窗模态框，支持点击遮罩关闭
│   │   ├── Pagination.vue        # 分页组件，支持上一页下一页
│   │   ├── RoleSwitch.vue        # 角色切换组件，下拉选择
│   │   ├── Select.vue            # 下拉选择组件，支持选项搜索
│   │   ├── StatusTag.vue         # 状态标签组件，根据状态自动变色
│   │   └── TextArea.vue          # 多行文本输入组件
│   │
│   ├── pages/                    # 页面组件，按路由组织
│   │   ├── Home.vue              # 首页
│   │   ├── Login.vue             # 登录/注册页，邮箱验证码登录
│   │   ├── jobseeker/            # 求职者端页面
│   │   │   ├── Dashboard.vue     # 求职者首页，统计卡片展示
│   │   │   ├── ResumeList.vue    # 简历列表，新建/编辑/删除
│   │   │   ├── ResumeEdit.vue    # 简历编辑，分步表单
│   │   │   ├── JobList.vue       # 职位列表，筛选+搜索+无限滚动
│   │   │   ├── JobDetail.vue     # 职位详情，投递按钮
│   │   │   ├── MatchList.vue     # AI 推荐匹配列表
│   │   │   ├── InterviewList.vue # 模拟面试历史列表
│   │   │   ├── InterviewRoom.vue # 面试房间，流式对话
│   │   │   ├── Applications.vue  # 我的投递列表
│   │   │   └── Profile.vue       # 个人资料编辑
│   │   ├── recruiter/            # 招聘者端页面
│   │   │   ├── Dashboard.vue     # 招聘者首页，统计数据
│   │   │   ├── CompanyEdit.vue   # 企业信息编辑
│   │   │   ├── JobList.vue       # 我的职位列表
│   │   │   ├── JobEdit.vue       # 发布/编辑职位
│   │   │   ├── Applications.vue  # 申请列表
│   │   │   ├── ApplicationDetail.vue # 申请详情，查看简历
│   │   │   └── Profile.vue       # 招聘者资料
│   │   └── chat/
│   │       └── ChatRoom.vue      # 聊天室，实时消息
│   │
│   ├── composables/               # Composition API 工具函数
│   │   ├── useDarkMode.ts        # 暗黑模式（预留接口）
│   │   ├── useDebounce.ts        # 防抖工具，参数 delay ms
│   │   ├── useIntersectionObserver.ts # 无限滚动观察器封装
│   │   ├── useLoading.ts         # 加载状态管理，boolean 包装
│   │   ├── useModal.ts           # 弹窗状态管理，open/close
│   │   ├── useRealtime.ts        # Supabase 实时订阅封装，自动取消
│   │   ├── useToast.ts           # 消息提示 Toast，支持 success/error/info
│   │   └── useWindowSize.ts      # 窗口尺寸监听，响应移动端
│   │
│   ├── stores/                   # Pinia 状态存储 (Setup 风格)
│   │   ├── auth.ts               # 认证状态，用户信息，登录登出方法
│   │   ├── chat.ts               # 聊天未读计数状态管理
│   │   └── role.ts               # 当前角色状态，求职者/招聘者持久化
│   │
│   ├── lib/                      # 库和抽象层
│   │   ├── database.ts           # 数据库操作封装，所有查询放这里
│   │   ├── supabase.ts           # Supabase 客户端初始化，类型导出
│   │   └── llmStream.ts          # LLM 流式响应处理，自定义 buffer 拼接，用于模拟面试
│   │
│   ├── router/
│   │   └── index.ts              # Vue Router 路由配置，动态导入
│   │
│   ├── types/
│   │   └── index.ts              # 全局 TypeScript 类型定义，全部导出
│   │
│   ├── assets/
│   │   └── hero.png              # Hero 背景图
│   │
│   ├── style.css                 # 全局样式 + Tailwind 主题定义 + design system
│   └── main.ts                   # 应用入口，初始化 Pinia/Router
│
├── supabase/
│   ├── .temp/                    # Supabase CLI 本地缓存（不提交 Git）
│   ├── functions/                # Supabase Edge Functions (Deno Runtime)
│   │   ├── optimizeResume/
│   │   │   └── index.ts          # AI 简历优化打分，输入简历+职位，输出评分建议
│   │   ├── matchResumeJob/
│   │   │   └── index.ts          # AI 简历职位匹配评分，向量搜索+AI分析
│   │   ├── interviewAI/
│   │   │   └── index.ts          # AI 模拟面试（备用，当前前端直连）
│   │   ├── parseResume/
│   │   │   └── index.ts          # AI 简历解析，PDF→结构化JSON
│   │   ├── parseJob/
│   │   │   └── index.ts          # AI 职位解析，生成 embedding
│   │   └── generateChatMessage/
│   │       └── index.ts          # AI 聊天回复生成，上下文建议
│   ├── config.toml               # Supabase CLI 配置
│   ├── schema.sql                # 完整数据库表结构 + RLS 策略
│   └── seed.sql                  # 初始化种子数据（可选）
│
├── public/                       # 静态资源，保留
├── dist/                         # 生产构建输出（不提交 Git）
├── DESIGN.md                     # 完整设计规范文档
├── CLAUDE.md                     # Claude Code 开发指南
├── vercel.json                   # Vercel 部署配置，SPA 回退规则
├── tsconfig.json                 # TypeScript 主配置
├── tsconfig.app.json             # TypeScript 应用配置
├── vite.config.ts                # Vite 配置，端口 3000
├── package.json                  # NPM 依赖定义
├── .gitignore                    # Git 忽略规则
├── .env                          # 本地环境变量（不提交 Git）
└── README.md                     # 本文件
```

---

## 🐘 数据库架构详解

项目使用 Supabase PostgreSQL，所有表都启用**行级安全 (RLS)**，确保数据安全。

### 表结构详细说明

#### 1. `profiles` - 用户资料表
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键，关联 `auth.users(id)`，级联删除 |
| `email` | TEXT | 用户邮箱，必填 |
| `full_name` | TEXT | 全名 |
| `avatar_url` | TEXT | 头像 URL |
| `role` | TEXT | 角色：`jobseeker` / `recruiter`，默认 `jobseeker` |
| `phone` | TEXT | 电话 |
| `city` | TEXT | 所在城市 |
| `bio` | TEXT | 个人简介 |
| `created_at` | TIMESTAMPTZ | 创建时间 |
| `updated_at` | TIMESTAMPTZ | 更新时间，触发器自动更新 |

**RLS 策略**:
- 所有人可读自己和他人资料
- 只能更新自己的资料

#### 2. `companies` - 企业信息表
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `recruiter_id` | UUID | 关联 `profiles.id` |
| `name` | TEXT | 企业名称 |
| `logo_url` | TEXT | Logo URL |
| `industry` | TEXT | 行业 |
| `scale` | TEXT | 规模：如 "20-99人" |
| `financing` | TEXT | 融资阶段：如 "A轮" |
| `city` | TEXT | 城市 |
| `address` | TEXT | 详细地址 |
| `description` | TEXT | 企业介绍 |
| `website` | TEXT | 官网 |

**RLS 策略**:
- 所有人可读
- 只有创建者可编辑删除

#### 3. `jobs` - 职位表
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `recruiter_id` | UUID | 发布者 ID |
| `company_id` | UUID | 关联企业 ID |
| `title` | TEXT | 职位标题 |
| `description` | TEXT | 职位描述 |
| `requirements` | TEXT | 职位要求 |
| `city` | TEXT | 工作城市 |
| `district` | TEXT | 区域 |
| `salary_min` | INTEGER | 最低薪资，单位：千(K) |
| `salary_max` | INTEGER | 最高薪资 |
| `experience` | TEXT | 经验要求 |
| `education` | TEXT | 学历要求 |
| `job_type` | TEXT | 工作类型：全职/兼职/实习 |
| `tags` | TEXT[] | 技能标签数组 |
| `status` | TEXT | 状态：`active`/`closed`/`draft` |
| `view_count` | INTEGER | 浏览次数 |
| `embedding` | VECTOR(1536) | 语义向量 |

**索引**:
- `idx_jobs_city` - 城市筛选索引
- `idx_jobs_salary` - 薪资范围索引
- `idx_jobs_status` - 状态筛选索引
- `idx_jobs_created_at` - 创建时间倒序索引

**RLS 策略**:
- 所有人可看 `active` 职位
- 发布者可管理自己的所有职位

#### 4. `resumes` - 简历表
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `user_id` | UUID | 所有者 ID |
| `title` | TEXT | 简历标题 |
| `file_url` | TEXT | 原始 PDF URL |
| `basic_info` | JSONB | 基本信息：`{name, gender, age, phone, email, city}` |
| `education` | JSONB | 教育经历数组：`[{school, degree, major, start, end}]` |
| `experience` | JSONB | 工作经历数组：`[{company, position, start, end, description}]` |
| `skills` | TEXT[] | 技能标签数组 |
| `projects` | JSONB | 项目经历数组：`[{name, role, description, start, end}]` |
| `certificates` | TEXT[] | 证书数组 |
| `self_evaluation` | TEXT | 自我评价 |
| `ai_optimized_content` | TEXT | AI 优化后全文 |
| `ai_score` | INTEGER | AI 总分 0-100 |
| `ai_suggestions` | JSONB | AI 改进建议数组 |
| `embedding` | VECTOR(1536) | 简历语义向量 |
| `is_default` | BOOLEAN | 是否默认简历 |

**RLS 策略**:
- 用户只能管理自己的简历
- 如果简历被投递，对应的招聘者可以查看

#### 5. `applications` - 职位申请表
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `job_id` | UUID | 关联职位 |
| `user_id` | UUID | 求职者 ID |
| `recruiter_id` | UUID | 招聘者 ID |
| `resume_id` | UUID | 使用的简历 ID |
| `status` | TEXT | 状态：`pending`/`viewed`/`interview`/`offer`/`rejected`/`withdrawn` |
| `ai_match_score` | INTEGER | AI 匹配分数 0-100 |
| `ai_match_detail` | JSONB | AI 匹配详情 |
| `cover_letter` | TEXT | 求职信 |
| `created_at` | TIMESTAMPTZ | 创建时间 |

**唯一约束**: `UNIQUE(job_id, user_id)` - 同一个求职者对同一个职位只能投递一次

**RLS 策略**:
- 求职者只能看自己投出的
- 招聘者只能看收到的
- 双方都可更新（求职者可撤回，招聘者可改状态）

#### 6. `conversations` - 聊天会话表
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `jobseeker_id` | UUID | 求职者 ID |
| `recruiter_id` | UUID | 招聘者 ID |
| `job_id` | UUID | 关联职位（可为空） |
| `last_message` | TEXT | 最后一条消息内容摘要 |
| `last_message_at` | TIMESTAMPTZ | 最后消息时间 |
| `jobseeker_unread` | INTEGER | 求职者未读数 |
| `recruiter_unread` | INTEGER | 招聘者未读数 |

**唯一约束**: `UNIQUE(jobseeker_id, recruiter_id, job_id)` - 同一职位不会重复创建会话

**RLS 策略**: 只有会话参与者可访问

#### 7. `messages` - 聊天消息表
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `conversation_id` | UUID | 关联会话 |
| `sender_id` | UUID | 发送者 ID |
| `content` | TEXT | 消息内容 |
| `message_type` | TEXT | 类型：`text`/`image`/`file`/`system` |
| `is_read` | BOOLEAN | 是否已读 |

**索引**: `idx_messages_conversation` - 按会话 + 创建时间倒序，分页查询优化

**RLS 策略**: 只有会话参与者可访问

#### 8. `interviews` - AI 模拟面试表
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `user_id` | UUID | 用户 ID |
| `job_id` | UUID | 目标职位（可为空） |
| `job_title` | TEXT | 职位标题（快照） |
| `status` | TEXT | 状态：`active`/`completed`/`cancelled` |
| `messages` | JSONB | 对话历史 `[{role: 'ai'|'user', content: string}]` |
| `ai_feedback` | JSONB | AI 最终反馈 |
| `ai_score` | INTEGER | AI 总分 0-100 |

**RLS 策略**: 用户只能管理自己的面试记录

### 数据库触发器

| 触发器 | 作用 |
|--------|------|
| `on_auth_user_created` | 新用户注册后自动在 `profiles` 插入一行 |
| `trigger_*_updated_at` | 所有表更新时自动更新 `updated_at` 字段 |

### 向量搜索函数 `match_jobs`

```sql
CREATE OR REPLACE FUNCTION match_jobs(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 10,
  match_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  similarity FLOAT
)
```

输入简历嵌入向量，返回匹配的职位 ID、标题、相似度。

### 存储桶 (Storage)

| 存储桶 | 公开性 | 用途 | RLS 策略 |
|--------|--------|------|----------|
| `resumes` | 私有 | 存储上传的 PDF 简历 | 用户只能访问自己的简历 |
| `avatars` | 公开 | 存储用户头像 | 任何人可读写自己的头像 |

### 实时推送 (Realtime)

启用了以下表的实时广播：
- `messages` - 聊天消息实时推送，进来新消息立即显示
- `conversations` - 会话未读数更新实时同步

完整 SQL 请参见 [supabase/schema.sql](./supabase/schema.sql)

---

## 💬 实时聊天工作流程

```
用户 A 发送消息 → 前端插入 messages 表 → Supabase Realtime 广播插入事件 → 用户 B 实时收到 → 自动滚动到底部 → 更新未读计数
                   ↓
会话表 conversations 更新 last_message / last_message_at / 对端未读计数 + 1
                   ↓
对端会话列表实时更新，显示最新消息和未读数
```

- 进入聊天房间后，前端订阅 `messages` 表的 INSERT 事件
- 收到新消息自动追加到列表，标记为已读
- 离开房间自动取消订阅

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
| AI 大模型 | OpenAI GPT-4 / DeepSeek Chat | - | 语义理解与生成 |
| 流式响应 | Server-Sent Events | - | 前端直连 LLM，逐字显示 |
| 部署 | Vercel (前端) + Supabase (后端) | - | 全栈无服务器架构 |

---

## 🚀 从零搭建详细步骤

### 前置要求

- Node.js 18.0 或更高版本
- Supabase 账号（免费版可运行完整功能）
- OpenAI API Key（用于 Edge Functions 调用 AI 能力）
- DeepSeek / ChatAnywhere API Key（用于 AI 模拟面试，也可使用 OpenAI）

### 1. 克隆代码

```bash
git clone https://github.com/hackdeacon/KirinGo.git
cd KirinGo
npm install
```

### 2. 创建 Supabase 项目

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 点击 "New project"
3. 选择组织、输入项目名称、设置数据库密码、选择离你近的区域
4. 等待项目初始化完成（约 2-3 分钟，喝杯咖啡）

### 3. 配置数据库

进入 Supabase → SQL Editor，点击 "New query"，执行以下操作：

**第一步：启用扩展**
```sql
create extension vector;
create extension "uuid-ossp";
```

点击 "Run" 执行。

**第二步：导入完整表结构**
复制 [supabase/schema.sql](./supabase/schema.sql) 文件中的全部内容，粘贴到 SQL Editor，点击 "Run"。

执行完成后，你应该能看到：
- 所有 8 张表已创建成功
- 所有 RLS 安全策略已创建
- `profiles` 触发器已创建（新用户注册自动创建资料）
- 向量匹配函数 `match_jobs()` 已创建
- 两个存储桶 `resumes` 和 `avatars` 已创建
- Realtime 已启用
- `updated_at` 自动更新触发器已创建

**验证**: 在左侧 Table Editor 中应该能看到所有 8 张表。

### 4. 配置认证 (Auth)

1. 进入 Supabase → Authentication → Providers
2. 找到 "Email" 提供者，点击编辑
3. 勾选 "Enable Email provider"
4. **可选**：如果你不需要邮箱验证，取消勾选 "Confirm email"，这样用户注册后可直接登录
5. 保存
6. 如果你需要第三方登录（Google、Github 等），可另行配置，项目已支持 Supabase 第三方登录开箱即用

7. **配置网站 URL**
   - 进入 Authentication → URL Configuration
   - Site URL: `http://localhost:3000`（开发环境）
   - 生产环境填写你的 Vercel 域名，例如 `https://kiringo.vercel.app`
   - 在 "Redirect URLs" 添加：
     - `http://localhost:3000/*`
     - `https://你的域名.vercel.app/*`

### 5. 配置 Storage CORS

如果遇到头像无法上传问题，需要配置 CORS：

1. 进入 Storage → Settings
2. 在 CORS 配置区域添加：
   ```
   http://localhost:3000
   https://你的域名.vercel.app
   ```
3. 保存

### 6. 获取项目密钥

在 Supabase → Settings → API：
- 复制 `Project URL` → 这是你的 `VITE_SUPABASE_URL`
- 复制 `anon public` 密钥 → 这是你的 `VITE_SUPABASE_ANON_KEY`

> 🔒 安全说明：我们只在前端使用**匿名密钥**，敏感操作都由 Edge Functions 处理，符合最佳实践。

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

输出应该类似：
```
  VITE v8.0.0  ready in 300 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
```

打开浏览器访问 `http://localhost:3000`，你应该能看到首页。尝试注册账号，如果能正常登录进入首页，说明配置成功。

### 9. 部署 Edge Functions

> ⚠️ 这一步是**必须**的，因为 AI 简历优化、解析、匹配都需要 Edge Functions。

首先安装 [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
# macOS Homebrew
brew install supabase/tap/supabase

# 其他系统请参考 https://supabase.com/docs/guides/cli/installation
```

登录 Supabase：

```bash
supabase login
```

会打开浏览器授权，确认后即可登录。

设置 OpenAI API Key 为 Supabase 全局密钥（所有 Edge Functions 共享）：

```bash
supabase secrets set OPENAI_API_KEY=your-openai-api-key --project-ref your-project-ref
```

> 项目 ref 可以在 Supabase Settings → General → Project ID 找到。

部署所有 Edge Functions：

```bash
supabase functions deploy
```

这会自动部署以下 6 个函数：
- `optimizeResume` - AI 简历优化
- `matchResumeJob` - AI 简历职位匹配
- `interviewAI` - AI 模拟面试（备用）
- `parseResume` - AI 简历解析
- `parseJob` - AI 职位解析
- `generateChatMessage` - AI 聊天助手

部署完成后，进入 Supabase Dashboard → Edge Functions，可以看到所有函数都列出来了，状态为 "Deployed"。

**本地开发测试单个函数：**
```bash
supabase functions serve optimizeResume --env-file .env
```

会在本地启动函数，你可以用 Postman 测试。

### 10. 生产部署到 Vercel

**方法一：通过 Vercel Git 集成（推荐）**

1. 将代码推送到你的 GitHub 仓库
2. 登录 [Vercel Dashboard](https://vercel.com/)
3. 点击 "New Project" → Import 你的 GitHub 仓库
4. 在 "Environment Variables" 中，添加所有 `.env` 中的变量
5. 点击 "Deploy"
6. 等待构建完成 → 访问你的 Vercel 域名 → 完成 ✅

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
- ✅ 可以一键切换到招聘者角色

### 招聘者 (`recruiter`)
- ✅ 创建/编辑企业信息
- ✅ 发布/编辑/关闭职位
- ✅ 查看收到的申请
- ✅ 查看投过来的简历
- ✅ 更新申请状态
- ✅ 与求职者聊天
- ✅ 编辑个人资料
- ✅ 可以一键切换到求职者角色

**切换角色**：点击右上角头像 → 切换角色，即可在两种角色间切换，一份账号同时拥有两种身份。适合既找工作又招人的用户。

---

## 🔒 安全性

| 安全措施 | 说明 |
|----------|------|
| 行级安全 (RLS) | 每张表都配置了精确的 RLS 策略，用户只能访问有权限的数据 |
| JWT 验证 | Edge Functions 会验证 Supabase JWT 才处理请求，未登录无法调用 |
| 存储桶访问控制 | 简历存储桶是私有的，用户只能访问自己的简历 |
| 敏感密钥隔离 | OpenAI API Key 只存在于 Supabase Edge Functions 环境，**永不暴露给前端** |
| 最小权限原则 | 前端只使用 Supabase 匿名密钥，权限被严格限制 |
| 级联删除 | 删除用户/职位时，相关数据自动级联删除，不残留垃圾数据 |

---

## ❌ 故障排查

### `npm install` 网络错误

```bash
# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

### 注册后跳首页，看不到用户信息

检查：Supabase → Authentication → Triggers，确认 `on_auth_user_created` 触发器存在，它会自动创建 `profiles` 记录。如果不存在，重新执行一遍 `schema.sql`。

### 上传头像报错 CORS

检查：Supabase → Storage → Settings → CORS 配置，确保添加了 `http://localhost:3000` 和你的生产域名。

### AI 简历优化返回 401/500

检查：
1. Supabase → Edge Functions → `optimizeResume` → 查看 Logs
2. 确认 `OPENAI_API_KEY` 在 Supabase Secrets 中设置正确
3. 确认 OpenAI 账号有余额

### AI 模拟面试无法连接

检查 `.env` 配置：
- API Key 正确
- API Base URL 正确（结尾要带 `/v1`）
- 模型名称正确
- 你的 API Key 有对应模型的访问权限

### pgvector 扩展不存在

免费版 Supabase 也支持，手动启用即可：
```sql
create extension vector;
```
在 Supabase SQL Editor 执行即可。

### Vercel 部署后刷新 404

项目已经有 `vercel.json` 配置了，如果还出现，检查 Vercel 项目设置 → Build & Development Settings → 输出目录是否是 `dist`。

---

## ❓ 常见问题 FAQ

**Q: 可以不用 Supabase 吗？**
A: 不行，项目深度整合了 Supabase 的 Auth、Database、Storage、Realtime、Edge Functions，换其他后端需要大量重构。

**Q: 免费版 Supabase 可以运行吗？**
A: 完全可以，免费版的配额足够个人开发和小流量使用。

**Q: AI 模拟面试一定要 ChatAnywhere 吗？**
A: 不需要，支持 ChatAnywhere / DeepSeek / OpenAI，配置其中一个就行，优先级按代码中的来。

**Q: 为什么 AI 模拟面试是前端直连而不是走 Edge Function？**
A: 前端直连可以减少中转，流式响应更流畅，也节省 Edge Function 执行时间和配额。

**Q: 邮箱验证不能通过，注册不了怎么办？**
A: 在 Supabase Authentication → Providers → Email，关掉 "Confirm email" 即可。

**Q: 一个用户可以同时拥有两种角色吗？**
A: 可以，一键切换，一份账号用到底。

**Q: 支持多人同时聊天吗？**
A: 支持，基于 Supabase Realtime，支持多对多实时聊天。

---

## 🧑‍💻 开发指南

### 代码规范

- 组件文件命名：`PascalCase.vue`，例如 `JobCard.vue`
- 工具文件命名：`camelCase.ts`，例如 `useToast.ts`
- 所有全局类型在 `src/types/index.ts` 导出
- Pinia Store 使用函数式 Setup 风格
- UI 文本和注释优先使用中文
- 路由采用代码分割，动态导入页面
- 数据库操作统一通过 `src/lib/database.ts` 封装，不在组件中直接写查询

### 添加新页面

1. 在 `src/pages/` 对应角色目录下创建 `.vue` 文件
2. 在 `src/router/index.ts` 添加路由记录，使用动态导入
3. 如果需要在侧边菜单显示，在 `AppSidebar.vue` 添加菜单项

### 添加新的 Edge Function

```bash
supabase functions new myFunction
```

在 `supabase/functions/myFunction/index.ts` 开发，所有 Edge Functions 默认都需要验证 JWT：

```typescript
// 开头获取用户 ID
const authHeader = req.headers.get('Authorization')
if (!authHeader) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
}
const token = authHeader.replace('Bearer ', '')
const { data: { user }, error } = await supabase.auth.getUser(token)
if (!user || error) {
  return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
}
```

部署：

```bash
supabase functions deploy myFunction --project-ref your-project-ref
```

### 调试

浏览器打开 `http://localhost:3000`，打开 DevTools → Console 查看日志。

Edge Functions 调试：Supabase Dashboard → Edge Functions → 函数 → Logs 查看日志。

---

## 📊 TypeScript 类型

所有核心类型定义在 `src/types/index.ts`，包括：

- `Profile` - 用户资料
- `Company` - 企业信息
- `Job` - 职位
- `Resume` - 简历
- `Application` - 申请
- `Conversation` - 对话
- `Message` - 消息
- `Interview` - 面试记录

所有数据库操作返回类型都基于这些定义。

---

## 🤝 贡献

欢迎贡献代码！流程：

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/你的功能名称`
3. 提交改动：`git commit -m 'Add: 某某功能'`
4. 推送到分支：`git push origin feature/你的功能名称`
5. 创建 Pull Request

### 贡献方向

- 🐛 修复 Bug
- ✨ 新增功能
- 🎨 设计优化
- 📝 文档完善

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
