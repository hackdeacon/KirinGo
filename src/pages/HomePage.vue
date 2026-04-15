<template>
  <div class="home-page">
    <!-- Hero 区域 -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-badge animate-fade-in text-mono">
          <div class="badge-dot-live"></div>
          <span class="badge-content">NEXT-GEN AI RECRUITMENT</span>
        </div>
        <h1 class="hero-title animate-fade-in-up">
          <template v-if="authStore.isRecruiter">
            Build your team<br />with KirinGo.
          </template>
          <template v-else>
            Build your career<br />with KirinGo.
          </template>
        </h1>
        <p class="hero-desc animate-fade-in-up" style="animation-delay: 0.1s">
          <template v-if="authStore.isRecruiter">
            智能 AI 驱动的招聘平台，通过人才深度匹配、<br>精准简历诊断与高效面试协作，助你寻找并连接最顶尖的牛人。
          </template>
          <template v-else>
            智能 AI 驱动的招聘平台，通过简历深度诊断、<br>精准职位匹配与全真面试模拟，助你开启职业生涯新篇章。
          </template>
        </p>

        <!-- 极简搜索栏 -->
        <div class="search-container animate-fade-in-up" style="animation-delay: 0.2s">
          <div class="search-bar-v2">
            <SearchIcon class="search-icon" />
            <input
              v-model="searchKeyword"
              type="text"
              class="search-input"
              :placeholder="authStore.isRecruiter ? '搜索牛人、技能、学校或岗位关键词...' : '搜索职位、公司或技能关键词...'"
              @keyup.enter="handleSearch"
            />
            <button class="search-submit-btn" @click="handleSearch">
              <ArrowRightIcon class="icon-sm" />
            </button>
          </div>

          <div class="hot-tags-v2">
            <button v-for="tag in hotTags" :key="tag" class="tag-pill-sm" @click="searchByTag(tag)">
              {{ tag }}
            </button>
          </div>
        </div>

        <div class="hero-ctas animate-fade-in-up" style="animation-delay: 0.4s">
          <router-link :to="authStore.isRecruiter ? '/recruiter/candidates' : '/jobs'" class="btn btn-primary btn-hero">
            {{ authStore.isRecruiter ? '寻找人才' : '探索机会' }}
          </router-link>
          <router-link v-if="!authStore.isAuthenticated" to="/auth/register" class="btn btn-ghost">立即加入</router-link>
        </div>
      </div>
    </section>

    <!-- AI 招聘全流程 - Timeline Style -->
    <section class="timeline-section">
      <div class="container-cursor">
        <div class="section-intro">
          <h2 class="text-heading mb-4">AI 赋能求职全链路</h2>
          <p class="text-body-serif">基于领先的 LLM 技术，我们重塑了从简历到入职的每一个环节。</p>
        </div>

        <div class="ai-timeline">
          <div v-for="(step, i) in timelineSteps" :key="step.title" class="timeline-block" :class="{ 'reverse': i % 2 !== 0 }">
            <div class="timeline-visual animate-fade-in-up" :style="{ animationDelay: `${i * 0.2}s` }">
              <!-- 模拟代码编辑器预览 -->
              <div class="code-preview-card card">
                <div class="code-header">
                  <div class="dots"><span></span><span></span><span></span></div>
                  <div class="filename text-mono">{{ step.file }}</div>
                </div>
                <div class="code-body text-mono">
                  <div v-for="(line, idx) in step.codeLines" :key="idx" class="code-line">
                    <span class="line-num">{{ idx + 1 }}</span>
                    <span class="line-content" v-html="line"></span>
                  </div>
                </div>
              </div>
            </div>
            <div class="timeline-info animate-fade-in-up" :style="{ animationDelay: `${i * 0.2 + 0.1}s` }">
              <div class="step-badge" :style="{ backgroundColor: step.color + '20', color: step.color }">
                <component :is="step.icon" class="icon-xs mr-2" />
                <span class="text-mono">{{ step.label }}</span>
              </div>
              <h3 class="text-subheading mb-4">{{ step.title }}</h3>
              <p class="text-body-serif mb-6">{{ step.desc }}</p>
              <router-link :to="step.link" class="feature-link">
                {{ step.action }} <ChevronRightIcon class="icon-inline" />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 推荐职位 -->
    <section class="jobs-section">
      <div class="container-cursor">
        <div class="section-header-v2 animate-fade-in-up">
          <div class="header-content">
            <div class="section-tag text-mono">LATEST OPPORTUNITIES</div>
            <h2 class="text-heading mt-2 mb-2">为您精准推荐</h2>
            <p class="text-body-serif">AI 实时分析您的技能画像，从海量岗位中锁定最契合的机会。</p>
          </div>
          <router-link to="/jobs" class="btn btn-secondary">
            查看全部职位 <ArrowRightIcon class="icon-xs ml-2" />
          </router-link>
        </div>

        <div class="jobs-grid-v2">
          <JobCard
            v-for="(job, i) in recommendedJobs"
            :key="job.id"
            :job="job"
            class="animate-fade-in-up"
            :style="{ animationDelay: `${i * 0.1}s` }"
          />
        </div>
      </div>
    </section>

    <!-- 全局页脚 / 数据统计 -->
    <footer class="stats-section-v2">
      <div class="container-cursor">
        <div class="stats-grid-v2">
          <div v-for="(stat, i) in stats" :key="stat.label" class="stat-card-v2 animate-fade-in" :style="{ animationDelay: `${i * 0.15}s` }">
            <div class="stat-number-v2 text-mono">{{ stat.value }}</div>
            <div class="stat-label-v2 text-mono">{{ stat.label }}</div>
            <div class="stat-bar" :style="{ backgroundColor: getStatColor(i) }"></div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCompanies, fetchHomeStats } from '@/lib/database'
import { useJobStore } from '@/stores/jobs'
import { useAuthStore } from '@/stores/auth'
import type { Company } from '@/types'
import JobCard from '@/components/JobCard.vue'
import {
  Search as SearchIcon,
  Sparkles as SparklesIcon,
  ArrowRight as ArrowRightIcon,
  ChevronRight as ChevronRightIcon,
  FileSearch as FileSearchIcon,
  Target as TargetIcon,
  Mic as MicIcon,
  MessageSquare as MessageSquareIcon
} from 'lucide-vue-next'

const router = useRouter()
const jobStore = useJobStore()
const authStore = useAuthStore()

const searchKeyword = ref('')
const hotTags = computed(() => {
  if (authStore.isRecruiter) {
    return ['本科', '计算机', '人工智能', '前端开发', 'Java', '数据分析']
  }
  return ['前端开发', 'Java', 'AI 算法', '产品经理', 'Go 语言', '数据分析']
})

const loading = ref(true)

const timelineSteps = [
  {
    icon: FileSearchIcon,
    label: 'DIAGNOSE',
    title: '简历深度诊断',
    desc: 'AI 自动解析简历语义，诊断工作描述的竞争力和行业关键词覆盖率，提供专业级优化建议。',
    color: '#dfa88f', // Thinking peach
    file: 'resume_audit.ts',
    codeLines: [
      '<span class="keyword">const</span> analysis = <span class="keyword">await</span> ai.audit(resume);',
      '<span class="comment">// 发现 3 处核心技能缺失</span>',
      'analysis.suggest(<span class="string">"Quantifiable impact"</span>);'
    ],
    link: '/resume',
    action: '立即诊断'
  },
  {
    icon: TargetIcon,
    label: 'MATCH',
    title: '智能职位匹配',
    desc: '多维度匹配算法不仅看技能关键词，更理解你的职业路径与企业需求的契合度。',
    color: '#9fc9a2', // Grep sage
    file: 'job_matcher.py',
    codeLines: [
      '<span class="keyword">def</span> <span class="function">find_perfect_match</span>(user, jobs):',
      '    scores = [ai.similarity(user, j) <span class="keyword">for</span> j <span class="keyword">in</span> jobs]',
      '    <span class="keyword">return</span> sorted(jobs, key=scores)[:<span class="number">5</span>]'
    ],
    link: '/jobs',
    action: '查看匹配'
  },
  {
    icon: MicIcon,
    label: 'INTERVIEW',
    title: 'AI 模拟面试',
    desc: '全真模拟技术与 HR 面试场景，AI 面试官根据你的表现提供实时反馈与提升建议。',
    color: '#c0a8dd', // Edit lavender
    file: 'mock_interview.json',
    codeLines: [
      '{ <span class="string">"q"</span>: <span class="string">"如何处理高并发？"</span>,',
      '  <span class="string">"feedback"</span>: <span class="string">"建议补充 Redis 细节"</span>,',
      '  <span class="string">"score"</span>: <span class="number">85</span> }'
    ],
    link: '/interview',
    action: '开始面试'
  }
]

const stats = ref([
  { value: '0', label: '在招职位' },
  { value: '0', label: '合作企业' },
  { value: '0', label: '注册用户' },
  { value: '0', label: '累计投递' },
])

const recommendedJobs = computed(() => jobStore.jobs.slice(0, 6))

function getStatColor(index: number) {
  const colors = ['#dfa88f', '#9fc9a2', '#9fbbe0', '#c0a8dd']
  return colors[index % colors.length]
}

function handleSearch() {
  if (authStore.isRecruiter) {
    router.push({ path: '/recruiter/candidates', query: { keyword: searchKeyword.value } })
  } else {
    jobStore.setFilters({ keyword: searchKeyword.value })
    router.push({ path: '/jobs', query: { keyword: searchKeyword.value } })
  }
}

function searchByTag(tag: string) {
  searchKeyword.value = tag
  if (authStore.isRecruiter) {
    router.push({ path: '/recruiter/candidates', query: { keyword: tag } })
  } else {
    jobStore.setFilters({ keyword: tag })
    router.push({ path: '/jobs', query: { keyword: tag } })
  }
}

onMounted(async () => {
  try {
    const [_, statsData] = await Promise.all([
      jobStore.fetchJobs(),
      fetchHomeStats()
    ])
    if (statsData) {
      stats.value = statsData
    }
  } catch (error) {
    console.error('首页数据加载失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background-color: var(--color-bg-canvas);
  min-height: calc(100vh - 48px); /* 减去 Header 高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
}

.hero-container {
  max-width: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  background: var(--color-bg-surface-300);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
  transition: all 0.3s ease;
  cursor: default;
}

.hero-badge:hover {
  background: var(--color-bg-surface-400);
  border-color: var(--color-border-medium);
  transform: translateY(-1px);
}

.badge-dot-live {
  width: 6px;
  height: 6px;
  background-color: var(--color-primary);
  border-radius: 50%;
  margin-right: 10px;
  position: relative;
}

.badge-dot-live::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 1px solid var(--color-primary);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
}

.badge-content {
  font-weight: 500;
}

.text-orange {
  color: var(--color-primary);
}

.hero-title {
  font-family: var(--font-display);
  font-size: var(--font-size-hero);
  line-height: 1.05;
  letter-spacing: var(--tracking-hero);
  color: var(--color-text-primary);
  margin-bottom: 32px;
}

.hero-desc {
  font-family: var(--font-serif);
  font-size: var(--font-size-body-serif);
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: 64px;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}

.search-container {
  width: 100%;
  max-width: 600px;
  margin-bottom: 64px;
}

.search-bar-v2 {
  display: flex;
  align-items: center;
  background: var(--color-bg-surface-100);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 8px 8px 8px 24px;
  gap: 16px;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.search-bar-v2:focus-within {
  border-color: var(--color-border-medium);
  background: var(--color-bg-surface-200);
  box-shadow: var(--shadow-focus);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  color: var(--color-text-primary);
  background: transparent;
  font-family: var(--font-sans);
}

.search-submit-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-text-primary);
  color: var(--color-bg-canvas);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.search-submit-btn:hover {
  background: var(--color-primary);
  transform: scale(1.05);
}

.hot-tags-v2 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.tag-pill-sm {
  padding: 4px 12px;
  font-size: 12px;
  font-family: var(--font-display);
  background: transparent;
  color: var(--color-text-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all 0.15s;
}

.tag-pill-sm:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}

.hero-ctas {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.btn-hero {
  padding: 12px 28px;
  font-size: 15px;
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-pill);
  box-shadow: 0 2px 8px rgba(245, 78, 0, 0.2);
  transition: all 0.2s ease;
}

.btn-hero:hover {
  color: white;
  filter: brightness(1.05);
  box-shadow: 0 4px 16px rgba(245, 78, 0, 0.25);
}

/* AI Timeline Section */
.timeline-section {
  padding: 120px 0;
  background-color: var(--color-bg-surface-100);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.section-intro {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 80px;
}

.ai-timeline {
  display: flex;
  flex-direction: column;
  gap: 120px;
}

.timeline-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.timeline-block.reverse {
  direction: rtl;
}

.timeline-block.reverse .timeline-info {
  direction: ltr;
}

.timeline-info {
  text-align: left;
}

.step-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 24px;
}

.step-badge .icon-xs {
  width: 12px;
  height: 12px;
}

/* Code Preview Component */
.code-preview-card {
  background: #1e1e1e; /* Dark code editor background */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  text-align: left;
}

.code-header {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.dots { display: flex; gap: 6px; }
.dots span { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); }

.filename {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.code-body {
  padding: 20px;
  font-size: 13px;
  line-height: 1.6;
}

.code-line {
  display: flex;
  gap: 16px;
}

.line-num {
  width: 20px;
  color: rgba(255, 255, 255, 0.2);
  text-align: right;
  user-select: none;
}

.line-content { color: #d4d4d4; }
.line-content :deep(.keyword) { color: #569cd6; }
.line-content :deep(.function) { color: #dcdcaa; }
.line-content :deep(.string) { color: #ce9178; }
.line-content :deep(.comment) { color: #6a9955; }
.line-content :deep(.number) { color: #b5cea8; }

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--color-primary);
  text-decoration: none;
  transition: all 0.2s;
}

.feature-link:hover {
  gap: 8px;
  color: var(--color-error);
}

/* Recommended Jobs Section */
.jobs-section {
  padding: 120px 0;
  background-color: var(--color-bg-surface-100);
  border-top: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
}

.container-cursor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-header-v2 {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 64px;
}

.header-content {
  max-width: 600px;
}

.section-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.text-heading {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.72px;
  color: var(--color-text-primary);
}

.text-body-serif {
  font-family: var(--font-serif);
  font-size: 17.28px;
  line-height: 1.35;
  color: var(--color-text-secondary);
}

.jobs-grid-v2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.jobs-grid-v2 > * {
  border-radius: 10px;
  overflow: hidden;
  box-shadow:
    rgba(0, 0, 0, 0.14) 0px 28px 70px,
    rgba(0, 0, 0, 0.1) 0px 14px 32px,
    oklab(0.263084 -0.00230259 0.0124794 / 0.1) 0px 0px 0px 1px;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 12px 20px;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 400;
  background: var(--color-bg-surface-300);
  color: var(--color-text-primary);
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  color: var(--color-error);
  border-color: oklab(0.263084 -0.00230259 0.0124794 / 0.2);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}

/* Stats Section V2 / Footer - Warm Dark Immersive */
.stats-section-v2 {
  padding: 120px 0 64px;
  background-color: #26251e;
  color: #ffffff;
  border-top: 1px solid oklab(1 0 0 / 0.08);
}

.footer-nav-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 64px;
  margin-top: 80px;
  padding-bottom: 80px;
  border-bottom: 1px solid oklab(1 0 0 / 0.05);
}

.footer-brand-col {
  max-width: 320px;
}

.footer-brand-desc {
  font-size: 15px;
  line-height: 1.6;
  color: oklab(1 0 0 / 0.4);
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: oklab(1 0 0 / 0.04);
  border: 1px solid oklab(1 0 0 / 0.08);
  border-radius: 8px;
  color: oklab(1 0 0 / 0.4);
  transition: all 0.2s;
}

.social-icon-btn:hover {
  background: oklab(1 0 0 / 0.08);
  color: #ffffff;
  transform: translateY(-2px);
}

.footer-col-title {
  font-size: 11px;
  letter-spacing: 0.15em;
  color: oklab(1 0 0 / 0.3);
  margin-bottom: 24px;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-links a {
  font-family: var(--font-display);
  font-size: 14px;
  color: oklab(1 0 0 / 0.55);
  text-decoration: none;
  transition: all 0.15s;
}

.footer-links a:hover {
  color: #ffffff;
}

.footer-bottom {
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-logo {
  font-size: 24px;
  letter-spacing: -0.5px;
  color: #ffffff;
}

.footer-copyright {
  font-size: 10px;
  letter-spacing: 0.08em;
  color: oklab(1 0 0 / 0.25);
}

.footer-status-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 9px;
  letter-spacing: 0.12em;
  color: oklab(1 0 0 / 0.4);
  background: oklab(1 0 0 / 0.04);
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid oklab(1 0 0 / 0.08);
}

.status-pulse-dot {
  width: 5px;
  height: 5px;
  background-color: var(--color-success);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--color-success);
  animation: pulse-mini 2s infinite;
}

@keyframes pulse-mini {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

.stats-grid-v2 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-card-v2 {
  position: relative;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: oklab(1 0 0 / 0.02);
  border: 1px solid oklab(1 0 0 / 0.06);
  border-radius: 8px;
  transition: all 0.25s ease;
}

.stat-card-v2:hover {
  background: oklab(1 0 0 / 0.04);
  border-color: oklab(1 0 0 / 0.1);
  transform: translateY(-2px);
}

.stat-number-v2 {
  font-family: var(--font-display);
  font-size: 44px;
  line-height: 1.1;
  font-weight: 400;
  margin-bottom: 8px;
  letter-spacing: -1.2px;
  color: #ffffff;
}

.stat-label-v2 {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.15em;
  color: oklab(1 0 0 / 0.45);
  text-transform: uppercase;
  line-height: 1.2;
}

.stat-bar {
  position: static;
  transform: none;
  width: 32px;
  height: 2px;
  border-radius: 9999px;
  opacity: 0.6;
  margin-top: 16px;
}

.mr-1 { margin-right: 4px; }
.mr-2 { margin-right: 8px; }
.ml-2 { margin-left: 8px; }
.mt-2 { margin-top: 8px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.text-center { text-align: center; }
.icon-xs { width: 14px; height: 14px; }
.icon-inline { width: 14px; height: 14px; }

@media (max-width: 1024px) {
  .timeline-block { gap: 40px; }
  .stats-grid-v2 { gap: 24px; }
  .stat-number-v2 { font-size: 56px; letter-spacing: -1.2px; }
  .stat-card-v2 { padding: 40px 24px; }
}

@media (max-width: 834px) {
  .ai-timeline { gap: 80px; }
  .timeline-block { grid-template-columns: 1fr; gap: 40px; }
  .timeline-block.reverse { direction: ltr; }
  .jobs-grid-v2 { grid-template-columns: 1fr; }
  .stats-grid-v2 { grid-template-columns: repeat(2, 1fr); }
  .footer-nav-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
  .footer-brand-col { grid-column: span 2; max-width: 100%; }
  .hero-title { font-size: 56px; letter-spacing: -1.2px; }
  .section-header-v2 { flex-direction: column; align-items: flex-start; gap: 24px; }
  .text-heading { font-size: 28px; letter-spacing: -0.4px; }
}

@media (max-width: 768px) {
  .hero-section { padding: 100px 24px 120px; }
  .hero-title { font-size: 44px; letter-spacing: -0.8px; }
  .hero-desc { font-size: 16px; }
  .search-bar-v2 { padding: 6px 6px 6px 20px; }
  .search-input { font-size: 14px; }
  .stats-section-v2 { padding: 80px 0; }
  .stats-grid-v2 { gap: 16px; }
  .stat-number-v2 { font-size: 48px; letter-spacing: -0.8px; }
  .stat-card-v2 { padding: 32px 16px; }
  .jobs-section { padding: 80px 0; }
  .footer-nav-grid { grid-template-columns: 1fr; gap: 32px; }
  .footer-brand-col { grid-column: span 1; }
  .footer-bottom { flex-direction: column; gap: 16px; align-items: flex-start; }
}

@media (max-width: 480px) {
  .stats-grid-v2 { grid-template-columns: 1fr; }
}
</style>
