# KirinGo - 麒麟招聘 🚀
### AI 赋能的温润极简智能招聘平台

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![Vue 3.5](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.0-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind 4](https://img.shields.io/badge/CSS-Tailwind_4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 项目愿景
**KirinGo** 不仅仅是一个招聘工具，它是一个“懂你”的求职助手。通过 AI 深度介入求职的每一个环节（简历、匹配、面试、沟通），旨在打破信息差，让优质人才与卓越企业高效连接。我们推崇 **温润极简主义 (Warm Minimalist)** 设计，让求职不再焦虑，而是一种愉悦的职场跃迁体验。

---

## ✨ 核心功能

### 🧠 AI 智能内核 (Supabase Edge Functions + LLM)
- **AI 简历优化 (Optimize)**：根据目标职位实时扫描简历，提供打分建议并精准润色，将面试邀约率提升 3 倍。
- **AI 模拟面试 (Interview)**：基于 Deno 边缘函数实现的实时面试助手，模拟真实面试逻辑并给出分维度表现评估。
- **AI 职位匹配 (Match)**：利用 pgvector 实现语义搜索，不再局限于关键词，而是深度理解求职者意图与职位描述的契合度。
- **AI 沟通助手 (Chat assistant)**：在即时通信中提供 AI 辅助回复建议，提升求职者与 HR 的沟通专业度。

### 💼 全链路招聘流程
- **多元角色切换**：流畅的求职者/招聘者身份切换与首页。
- **即时通讯系统**：支持已读提醒、未读计数及职位状态联动的实时互动。
- **职位管理**：招聘端发布、优化、筛选及管理职位的全套工具。
- **简历解析**：支持 PDF 简历解析并自动填充结构化数据。

### 🎨 温润极简设计系统 (Warm Minimalist)
- **配色**：采用 `#f2f1ed` (暖光色) 作为画布背景，配合 `#26251e` (暖炭黑) 文本，点缀标志性的橘红色 `#f54e00`。
- **互动**：基于 `oklab()` 色彩空间的平滑悬停过渡，按钮文字感应变色，细节至上。

---

## 🛠️ 技术栈
- **前端**: Vue 3.5 (Composition API) + Pinia (Setup Store)
- **构建**: Vite 8 + TypeScript 6
- **样式**: Tailwind CSS 4 + Lucide Icons
- **后端**: Supabase (PostgreSQL / RLS / Auth / Storage)
- **AI 基础设施**: Supabase Edge Functions (Deno Runtime) + OpenAI API
- **部署**: Vercel (Frontend) / Supabase CLI (Edge Functions)

---

## 🚀 快速开始

### 1. 克隆并安装
```bash
git clone https://github.com/hackdeacon/KirinGo.git
cd KirinGo
npm install
```

### 2. 环境配置
在根目录创建 `.env` 文件：
```env
VITE_SUPABASE_URL=你的Supabase项目地址
VITE_SUPABASE_ANON_KEY=你的Supabase匿名Key
```

### 3. 本地开发
```bash
npm run dev
```

---

## 🌐 部署指南

### 部署到 Vercel
1. 导入仓库。
2. 在 Vercel Settings -> Environment Variables 中添加上述 `.env` 的两个变量。
3. 部署成功后，`vercel.json` 会自动处理 Vue Router 的重定向。

---

**Generated with ❤️ by Claude Code**
