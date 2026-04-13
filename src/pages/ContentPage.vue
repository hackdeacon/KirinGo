<template>
  <div class="content-page animate-fade-in">
    <div class="container-cursor">
      <div class="content-layout">
        <!-- 侧边导航 (仅桌面端显示) -->
        <aside class="content-sidebar">
          <div class="sidebar-sticky">
            <h3 class="sidebar-title text-mono">DOCUMENTATION</h3>
            <nav class="sidebar-nav">
              <div v-for="section in navigation" :key="section.title" class="nav-section">
                <h4 class="nav-section-title text-mono">{{ section.title }}</h4>
                <router-link 
                  v-for="item in section.items" 
                  :key="item.path" 
                  :to="item.path" 
                  class="nav-item"
                  active-class="active"
                >
                  {{ item.label }}
                </router-link>
              </div>
            </nav>
          </div>
        </aside>

        <!-- 主内容区域 -->
        <main class="content-main">
          <div class="breadcrumb text-mono animate-fade-in-up">
            <span>KIRINGO</span>
            <span class="separator">/</span>
            <span>{{ currentCategory }}</span>
            <span class="separator">/</span>
            <span class="current">{{ pageTitle }}</span>
          </div>

          <article class="prose animate-fade-in-up" style="animation-delay: 0.1s">
            <h1 class="text-heading">{{ pageTitle }}</h1>
            <p class="last-updated text-mono">LAST UPDATED: {{ lastUpdated }}</p>
            
            <div class="article-body text-serif" v-html="pageContent"></div>
          </article>

          <!-- 底部反馈 -->
          <footer class="content-footer animate-fade-in-up" style="animation-delay: 0.2s">
            <div class="feedback-card card">
              <div class="feedback-text">
                <h4 class="text-display">对本页面有疑问？</h4>
                <p class="text-body-serif">我们的 AI 助手可以为您提供更详细的解答。</p>
              </div>
              <router-link to="/chat" class="btn btn-primary">
                <MessageSquareIcon class="icon-sm mr-2" /> 联系我们
              </router-link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { MessageSquare as MessageSquareIcon } from 'lucide-vue-next'

const route = useRoute()

const navigation = [
  {
    title: 'RESOURCES',
    items: [
      { label: '使用指南', path: '/docs/guide' },
      { label: '招聘中心', path: '/docs/recruitment' },
      { label: 'AI 模型说明', path: '/docs/ai-models' },
      { label: '更新日志', path: '/docs/changelog' },
    ]
  },
  {
    title: 'COMPANY',
    items: [
      { label: '关于我们', path: '/about' },
      { label: '加入我们', path: '/careers' },
      { label: '隐私协议', path: '/privacy' },
      { label: '服务条款', path: '/terms' },
    ]
  }
]

const pageData: Record<string, { title: string, category: string, updated: string, content: string }> = {
  'guide': {
    title: '使用指南',
    category: 'RESOURCES',
    updated: '2026-04-10',
    content: `
      <p>欢迎来到 麒麟智聘 使用指南。本平台旨在通过 AI 技术简化您的招聘与求职流程。</p>
      <h3>1. 个人资料完善</h3>
      <p>首先，请在“个人中心”完善您的基础信息。AI 将根据这些信息为您进行精准匹配。</p>
      <h3>2. 简历诊断与优化</h3>
      <p>上传您的简历后，AI 会自动进行深度诊断。您可以根据 AI 的建议一键优化简历内容，提升竞争力。</p>
      <h3>3. 智能投递</h3>
      <p>在职位列表中，您可以查看到与您匹配度最高的岗位。点击投递，您的优化简历将直达 HR 桌面。</p>
    `
  },
  'recruitment': {
    title: '招聘中心',
    category: 'RESOURCES',
    updated: '2026-04-05',
    content: `
      <p>麒麟智聘 为企业提供高效、精准的 AI 驱动招聘解决方案。</p>
      <h3>AI 筛选</h3>
      <p>告别手动翻阅。我们的系统会自动对海量简历进行语义分析，并根据岗位需求给出匹配分值。</p>
      <h3>人才画像</h3>
      <p>通过 AI 分析，您可以更直观地了解候选人的核心优势、技术栈以及职业稳定性。</p>
    `
  },
  'ai-models': {
    title: 'AI 模型说明',
    category: 'RESOURCES',
    updated: '2026-04-12',
    content: `
      <p>麒麟智聘 使用最先进的大语言模型（LLM）与自研的招聘领域垂直模型。</p>
      <h3>数据隐私</h3>
      <p>我们严格遵守数据安全规范，所有简历分析均在加密环境下进行，且不会用于基础模型的公开训练。</p>
      <h3>算法公平性</h3>
      <p>我们的模型经过严格的偏见测试，确保在筛选过程中不受性别、年龄等非专业因素的影响。</p>
    `
  },
  'changelog': {
    title: '更新日志',
    category: 'RESOURCES',
    updated: '2026-04-12',
    content: `
      <h3>v1.2.0 - 2026-04-12</h3>
      <ul>
        <li>重构了消息页面的三栏布局，提升沟通效率。</li>
        <li>优化了首页的视觉动效与页脚结构。</li>
        <li>增强了 AI 简历诊断的语境理解能力。</li>
      </ul>
      <h3>v1.1.0 - 2026-03-25</h3>
      <ul>
        <li>上线了 AI 模拟面试功能。</li>
        <li>支持多版本简历管理。</li>
      </ul>
    `
  },
  'about': {
    title: '关于我们',
    category: 'COMPANY',
    updated: '2026-01-01',
    content: `
      <p>麒麟智聘 成立于 2025 年，总部位于科技前沿。我们致力于用人工智能重塑职业发展的每一个关键节点。</p>
      <p>我们的使命是消除信息不对称，让每一个人都能找到最能发挥其才华的舞台。</p>
    `
  },
  'careers': {
    title: '加入我们',
    category: 'COMPANY',
    updated: '2026-04-12',
    content: `
      <p>我们正在寻找对 AI 和职业科技充满热情的伙伴。</p>
      <h3>在招职位</h3>
      <ul>
        <li>NLP 算法工程师 (Remote/Beijing)</li>
        <li>高级前端工程师 (Vue/TypeScript)</li>
        <li>产品经理 - AI 应用方向</li>
      </ul>
      <p>如果您感兴趣，请通过平台直接联系我们的 HR。</p>
    `
  },
  'privacy': {
    title: '隐私协议',
    category: 'COMPANY',
    updated: '2026-01-01',
    content: `
      <p>您的隐私对我们至关重要。本协议阐述了我们如何收集、使用和保护您的个人信息。</p>
      <p>我们绝不会将您的个人数据出售给第三方。所有数据仅用于提供和优化 麒麟智聘 的服务。</p>
    `
  },
  'terms': {
    title: '服务条款',
    category: 'COMPANY',
    updated: '2026-01-01',
    content: `
      <p>通过访问或使用 麒麟智聘，即表示您同意遵守本服务条款。</p>
      <p>您应对您的账户安全负责，并确保在平台上提供的信息真实有效。</p>
    `
  }
}

const currentKey = computed(() => {
  const path = route.path
  if (path.startsWith('/docs/')) return path.replace('/docs/', '')
  return path.replace('/', '')
})

const page = computed(() => pageData[currentKey.value] || {
  title: '页面未找到',
  category: 'UNKNOWN',
  updated: '-',
  content: '<p>抱歉，您访问的内容不存在。</p>'
})

const pageTitle = computed(() => page.value.title)
const currentCategory = computed(() => page.value.category)
const lastUpdated = computed(() => page.value.updated)
const pageContent = computed(() => page.value.content)
</script>

<style scoped>
.content-page {
  min-height: calc(100vh - 80px);
  background-color: var(--color-bg-canvas);
  padding: 64px 0 120px;
}

.content-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 80px;
}

/* 侧边栏 */
.content-sidebar {
  position: relative;
}

.sidebar-sticky {
  position: sticky;
  top: 108px;
}

.sidebar-title {
  font-size: 11px;
  letter-spacing: 0.15em;
  color: var(--color-text-tertiary);
  margin-bottom: 32px;
}

.nav-section {
  margin-bottom: 32px;
}

.nav-section-title {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
  margin-bottom: 16px;
  opacity: 0.6;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 8px 0;
  transition: all 0.2s;
  display: block;
}

.nav-item:hover {
  color: var(--color-primary);
  transform: translateX(4px);
}

.nav-item.active {
  color: var(--color-text-primary);
  font-weight: 500;
}

/* 主内容 */
.content-main {
  max-width: 800px;
}

.breadcrumb {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 48px;
}

.separator {
  opacity: 0.3;
}

.current {
  color: var(--color-text-secondary);
}

.prose h1 {
  font-size: 44px;
  line-height: 1.1;
  letter-spacing: -0.8px;
  margin-bottom: 16px;
}

.last-updated {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
  margin-bottom: 64px;
  display: block;
}

.article-body {
  font-size: 18px;
  line-height: 1.7;
  color: var(--color-text-primary);
}

.article-body :deep(h3) {
  font-family: var(--font-display);
  font-size: 24px;
  margin: 48px 0 24px;
  letter-spacing: -0.4px;
}

.article-body :deep(p) {
  margin-bottom: 24px;
}

.article-body :deep(ul) {
  margin-bottom: 24px;
  padding-left: 20px;
}

.article-body :deep(li) {
  margin-bottom: 12px;
  list-style-type: disc;
}

/* 底部反馈 */
.content-footer {
  margin-top: 120px;
  padding-top: 64px;
  border-top: 1px solid var(--color-border);
}

.feedback-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px;
  background-color: var(--color-bg-surface-200);
}

.feedback-text h4 {
  font-size: 20px;
  margin-bottom: 8px;
}

.feedback-text p {
  color: var(--color-text-secondary);
}

@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .content-sidebar {
    display: none;
  }
  .prose h1 {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .content-page {
    padding: 48px 0 80px;
  }
  .feedback-card {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
}
</style>
