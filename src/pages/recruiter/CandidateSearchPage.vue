<template>
  <div class="candidate-search-page animate-fade-in">
    <div class="container-layout">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">牛人搜索</h1>
          <p class="page-subtitle">在简历库中主动发掘优秀人才，找到适合您职位的牛人</p>
        </div>
        <div class="header-stats" v-if="total > 0">
          <div class="stat-item">
            <span class="stat-number">{{ total }}</span>
            <span class="stat-label">候选人</span>
          </div>
        </div>
      </div>

      <div class="main-layout">
        <!-- 左侧：筛选侧边栏 -->
        <aside class="filter-sidebar">
          <div class="sidebar-inner card">
            <div class="sidebar-header">
              <h2 class="sidebar-title text-mono">筛选条件</h2>
            </div>

            <div class="filter-group">
              <label class="filter-label">工作城市</label>
              <input
                v-model="filters.city"
                type="text"
                class="filter-input"
                placeholder="例如：北京、上海"
                @input="handleFilterChange"
              />
            </div>

            <div class="filter-group">
              <label class="filter-label">最低学历</label>
              <select v-model="filters.minDegree" class="filter-input" @change="handleFilterChange">
                <option value="">不限</option>
                <option value="大专">大专及以上</option>
                <option value="本科">本科及以上</option>
                <option value="硕士">硕士及以上</option>
                <option value="博士">博士</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">技能关键词</label>
              <input
                v-model="filters.skillsInput"
                type="text"
                class="filter-input"
                placeholder="Vue React TypeScript（空格分隔）"
                @input="handleFilterChange"
              />
              <div v-if="parsedSkills.length > 0" class="skill-tags">
                <span v-for="skill in parsedSkills" :key="skill" class="skill-tag">
                  {{ skill }}
                </span>
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-label">专业关键词</label>
              <input
                v-model="filters.major"
                type="text"
                class="filter-input"
                placeholder="计算机 软件工程"
                @input="handleFilterChange"
              />
            </div>

            <div class="filter-group">
              <label class="filter-label">最低 AI 评分</label>
              <select v-model="filters.minAiScore" class="filter-input" @change="handleFilterChange">
                <option :value="0">不限</option>
                <option :value="60">60 分以上</option>
                <option :value="70">70 分以上</option>
                <option :value="80">80 分以上</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">排序方式</label>
              <select v-model="filters.sortBy" class="filter-input" @change="handleFilterChange">
                <option value="ai_score">AI 评分降序</option>
                <option value="created_at">最新发布</option>
              </select>
            </div>

            <div class="sidebar-actions">
              <button class="btn btn-ghost btn-full" @click="handleReset">重置</button>
              <button class="btn btn-primary btn-full" @click="handleSearch">
                <SearchIcon class="icon-sm mr-2" />
                搜索
              </button>
            </div>
          </div>
        </aside>

        <!-- 右侧：候选人列表 -->
        <main class="result-area">
          <!-- 加载中 -->
          <div v-if="loading" class="loading-container card">
            <div class="loading-spinner"></div>
            <p class="loading-text text-body-serif text-tertiary">正在搜索候选人...</p>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && resumes.length === 0" class="empty-state card">
            <div class="empty-icon">
              <SearchIcon class="icon-xl" />
            </div>
            <h3 class="empty-title">未找到候选人</h3>
            <p class="empty-desc">尝试调整筛选条件，或清空筛选重新搜索</p>
            <button class="btn btn-primary" @click="handleReset">清空筛选</button>
          </div>

          <!-- 候选人列表 -->
          <div v-if="!loading && resumes.length > 0" class="candidates-list">
            <article
              v-for="item in resumes"
              :key="item.id"
              class="candidate-card card card-hover"
              @click="viewResume(item.user_id)"
            >
              <div class="card-header">
                <div class="candidate-avatar">
                  <AppAvatar :src="item.user.avatar_url" :alt="item.basic_info.name" size="lg" />
                </div>
                <div class="candidate-main">
                  <div class="candidate-basic">
                    <div class="basic-row">
                      <h3 class="candidate-name">{{ item.basic_info.name }}</h3>
                      <div
                        class="ai-score-badge"
                        :style="{
                          backgroundColor: getScoreBg(item.ai_score),
                          color: getScoreColor(item.ai_score)
                        }"
                      >
                        AI {{ item.ai_score }}
                      </div>
                    </div>
                    <p class="candidate-headline">{{ item.title }}</p>
                    <!-- 最近一份工作 -->
                    <div v-if="getLatestExperience(item.experience)" class="latest-experience">
                      <BriefcaseIcon class="icon-xs" />
                      <span>{{ getLatestExperience(item.experience) }}</span>
                    </div>
                  </div>

                  <!-- 基础信息网格 - 每一项都带图标，统一风格 -->
                  <div class="info-grid">
                    <div class="info-item">
                      <MapPinIcon class="icon-xs" />
                      <span class="info-value">{{ item.basic_info.city || '-' }}</span>
                    </div>
                    <div class="info-item">
                      <UserIcon class="icon-xs" />
                      <span class="info-value">{{ item.basic_info.age ? `${item.basic_info.age} 岁` : '-' }}</span>
                    </div>
                    <div class="info-item">
                      <GraduationCapIcon class="icon-xs" />
                      <span class="info-value">
                        {{ getHighestEducation(item.education) || '-' }}
                        <template v-if="getHighestMajor(item.education) && getHighestEducation(item.education)">
                           · {{ getHighestMajor(item.education) }}
                        </template>
                      </span>
                    </div>
                    <div class="info-item">
                      <BriefcaseIcon class="icon-xs" />
                      <span class="info-value">{{ calculateWorkYears(item.experience) || '0 年' }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions" @click.stop>
                  <router-link
                    :to="`/resume/view/${item.user_id}`"
                    target="_blank"
                    class="btn btn-outline btn-sm"
                  >
                    查看简历
                    <ExternalLinkIcon class="icon-xs ml-1" />
                  </router-link>
                  <button
                    class="btn btn-primary btn-sm"
                    @click="startChat(item)"
                  >
                    <MessageSquareIcon class="icon-xs mr-1" />
                    发起聊天
                  </button>
                </div>
              </div>

              <div class="card-body">
                <!-- 自我介绍预览 -->
                <div v-if="item.self_evaluation" class="self-evaluation-section">
                  <span class="section-label text-mono">自我评价</span>
                  <p class="self-evaluation-text">{{ truncateSelfEvaluation(item.self_evaluation) }}</p>
                </div>

                <!-- 技能区域（单独一行，因为专业已经合并到学历信息了） -->
                <div v-if="item.skills && item.skills.length > 0" class="skills-section">
                  <span class="section-label text-mono">技能</span>
                  <div class="skills-list">
                    <span
                      v-for="skill in item.skills.slice(0, 15)"
                      :key="skill"
                      class="skill-pill"
                    >
                      {{ skill }}
                    </span>
                    <span v-if="item.skills.length > 15" class="more-count">
                      +{{ item.skills.length - 15 }}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <!-- 分页 -->
          <div v-if="!loading && total > pageSize" class="pagination-container">
            <button
              class="btn btn-outline"
              :disabled="page === 1"
              @click="goToPage(page - 1)"
            >
              上一页
            </button>
            <div class="pagination-pages">
              <template v-for="p in visiblePages" :key="p">
                <button
                  v-if="p !== 0"
                  :class="['page-btn', p === page ? 'active' : '']"
                  @click="goToPage(p)"
                >
                  {{ p }}
                </button>
                <span v-else class="page-ellipsis">…</span>
              </template>
            </div>
            <button
              class="btn btn-outline"
              :disabled="page >= totalPages"
              @click="goToPage(page + 1)"
            >
              下一页
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCandidateResumes, ensureConversation } from '@/lib/database'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { Resume, Profile, ResumeEducation, ResumeExperience } from '@/types'
import AppAvatar from '@/components/AppAvatar.vue'
import {
  Search as SearchIcon,
  ExternalLink as ExternalLinkIcon,
  MessageSquare as MessageSquareIcon,
  MapPin as MapPinIcon,
  Briefcase as BriefcaseIcon,
  User as UserIcon,
  GraduationCap as GraduationCapIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const resumes = ref<(Resume & { user: Profile })[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const filters = ref({
  city: '',
  minDegree: '',
  skillsInput: '',
  major: '',
  minAiScore: 0,
  sortBy: 'ai_score' as 'ai_score' | 'created_at',
})

// Parse skills from input (split by space or comma)
const parsedSkills = computed(() => {
  if (!filters.value.skillsInput.trim()) return []
  return filters.value.skillsInput
    .trim()
    .split(/[\s,，]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
})

// Parse majors from input (split by space or comma)
const parsedMajors = computed(() => {
  if (!filters.value.major.trim()) return []
  return filters.value.major
    .trim()
    .split(/[\s,，]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// Generate visible page numbers for pagination
const visiblePages = computed(() => {
  const totalP = totalPages.value
  const current = page.value
  const pages: number[] = []

  if (totalP <= 7) {
    for (let i = 1; i <= totalP; i++) pages.push(i)
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push(0) // ellipsis
      pages.push(totalP)
    } else if (current >= totalP - 3) {
      pages.push(1)
      pages.push(0)
      for (let i = totalP - 4; i <= totalP; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push(0)
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push(0)
      pages.push(totalP)
    }
  }

  return pages
})

function getInitial(name: string) {
  return name?.charAt(0) || '?'
}

function getScoreBg(score: number) {
  if (score >= 80) return 'rgba(31, 138, 101, 0.12)'
  if (score >= 60) return 'rgba(192, 133, 50, 0.12)'
  return 'rgba(207, 45, 86, 0.12)'
}

function getScoreColor(score: number) {
  if (score >= 80) return '#1f8a65'
  if (score >= 60) return '#c08532'
  return '#cf2d56'
}

// 获取最高学历
function getHighestEducation(education: ResumeEducation[] | undefined) {
  if (!education || education.length === 0) return ''
  const order = ['大专', '本科', '硕士', '博士']
  let highest = ''
  let highestIndex = -1
  for (const edu of education) {
    const index = order.indexOf(edu.degree)
    if (index > highestIndex) {
      highestIndex = index
      highest = edu.degree
    }
  }
  return highest
}

// 获取最高学历对应的专业
function getHighestMajor(education: ResumeEducation[] | undefined) {
  if (!education || education.length === 0) return ''
  const order = ['大专', '本科', '硕士', '博士']
  let highestIndex = -1
  let highestMajor = ''
  for (const edu of education) {
    const index = order.indexOf(edu.degree)
    if (index > highestIndex) {
      highestIndex = index
      highestMajor = edu.major
    }
  }
  return highestMajor
}

// 获取最近一份工作（显示公司 + 职位）
function getLatestExperience(experience: ResumeExperience[] | undefined) {
  if (!experience || experience.length === 0) return ''
  // 数组最后一个是最新的
  const latest = experience[experience.length - 1]
  return `${latest.company} · ${latest.position}`
}

// 估算工作年限
function calculateWorkYears(experience: ResumeExperience[] | undefined): string {
  if (!experience || experience.length === 0) return '0 年'
  // 简单估算：累加每份工作的年份差
  let totalMonths = 0
  for (const exp of experience) {
    if (!exp.start || !exp.end) continue
    const startYear = parseInt(exp.start.substring(0, 4))
    const endYear = exp.end === '至今' ? new Date().getFullYear() : parseInt(exp.end.substring(0, 4))
    const startMonth = parseInt(exp.start.substring(5, 7)) || 1
    const endMonth = exp.end === '至今' ? new Date().getMonth() + 1 : parseInt(exp.end.substring(5, 7)) || 12
    totalMonths += (endYear - startYear) * 12 + (endMonth - startMonth)
  }
  const years = Math.max(1, Math.round(totalMonths / 12))
  return `${years} 年`
}

// 截断自我介绍用于预览
function truncateSelfEvaluation(text: string | undefined): string {
  if (!text) return ''
  if (text.length <= 140) return text
  return text.substring(0, 140) + '...'
}

let debounceTimer: number | null = null
function handleFilterChange() {
  // Debounce auto-search
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    page.value = 1
    loadCandidates()
  }, 400)
}

async function handleSearch() {
  page.value = 1
  await loadCandidates()
}

function handleReset() {
  filters.value = {
    city: '',
    minDegree: '',
    skillsInput: '',
    major: '',
    minAiScore: 0,
    sortBy: 'ai_score',
  }
  page.value = 1
  loadCandidates()
}

async function loadCandidates() {
  loading.value = true
  try {
    const result = await fetchCandidateResumes(page.value, pageSize.value, {
      city: filters.value.city || undefined,
      minDegree: filters.value.minDegree || undefined,
      majors: parsedMajors.value.length > 0 ? parsedMajors.value : undefined,
      minAiScore: filters.value.minAiScore > 0 ? filters.value.minAiScore : undefined,
      skills: parsedSkills.value.length > 0 ? parsedSkills.value : undefined,
      sortBy: filters.value.sortBy,
      sortOrder: 'desc',
    })
    resumes.value = result.resumes
    total.value = result.total
    // Scroll to top of result area
    document.querySelector('.result-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (error: any) {
    toast.error('加载候选人列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

async function goToPage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return
  page.value = newPage
  await loadCandidates()
}

function viewResume(userId: string) {
  window.open(`/resume/view/${userId}`, '_blank')
}

async function startChat(item: Resume & { user: Profile }) {
  try {
    const conversation = await ensureConversation({
      jobId: null,
      jobseekerId: item.user_id,
      recruiterId: authStore.user!.id,
    })
    router.push(`/chat/${conversation.id}`)
    toast.success('已创建对话')
  } catch (error: any) {
    toast.error('创建对话失败：' + error.message)
  }
}

onMounted(() => {
  loadCandidates()
})
</script>

<style scoped>
.candidate-search-page {
  padding: 48px 0 80px;
  background-color: var(--color-bg-canvas);
  min-height: calc(100vh - 80px);
}

.container-layout {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  flex: 1;
}

.page-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.72px;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.page-subtitle {
  font-family: var(--font-body);
  font-size: 17.28px;
  line-height: 1.35;
  color: var(--color-text-secondary);
  margin: 0;
}

.header-stats {
  text-align: right;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-number {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 400;
  line-height: 1;
  color: var(--color-primary);
}

.stat-label {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-secondary);
}

/* 主布局 - 左侧筛选 + 右侧列表 */
.main-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  align-items: start;
}

/* 左侧筛选侧边栏 */
.filter-sidebar {
  position: sticky;
  top: 100px;
}

.sidebar-inner {
  padding: 20px;
  background-color: var(--color-bg-surface-400);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.sidebar-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-title {
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin: 0;
}

.filter-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.filter-input {
  padding: 8px 10px;
  background-color: var(--color-bg-canvas);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  transition: all 0.15s ease;
}

.filter-input:focus {
  outline: none;
  border-color: var(--color-border-medium);
  box-shadow: 0 0 0 1px var(--color-border-medium);
}

.filter-input::placeholder {
  color: var(--color-text-tertiary);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.skill-tag {
  font-size: 10px;
  padding: 2px 6px;
  background-color: rgba(245, 78, 0, 0.1);
  color: var(--color-primary);
  border-radius: 9999px;
  font-family: var(--font-mono);
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.btn-full {
  width: 100%;
  justify-content: center;
}

/* 右侧结果区域 */
.result-area {
  min-height: 400px;
}

/* 加载和空状态 */
.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
  background-color: var(--color-bg-surface-400);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin: 16px 0 0;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-surface-300);
  border-radius: 24px;
  color: var(--color-text-tertiary);
  margin-bottom: 20px;
}

.empty-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -0.11px;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.empty-desc {
  font-family: var(--font-body);
  font-size: 17.28px;
  color: var(--color-text-secondary);
  margin: 0 0 24px;
}

/* 候选人列表 */
.candidates-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 候选人卡片 */
.candidate-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-surface-100);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.candidate-card:hover {
  box-shadow: rgba(0, 0, 0, 0.08) 0px 14px 32px, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px;
  border-color: var(--color-border-medium);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.candidate-avatar {
  flex-shrink: 0;
  padding-top: 2px;
}

.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-bg-surface-300);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--color-text-primary);
}

.candidate-main {
  flex: 1;
  min-width: 0;
}

.candidate-basic {
  margin-bottom: 12px;
}

.latest-experience {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.basic-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.candidate-name {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--color-text-primary);
  margin: 0;
}

.candidate-headline {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
  line-height: 1.4;
}

.ai-score-badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-family: var(--font-mono);
  font-weight: 500;
}

/* 信息网格：四列，每项都带图标，紧凑水平布局 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-value {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--color-text-primary);
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  flex-direction: column;
}

.card-body {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

/* 自我介绍预览 */
.self-evaluation-section {
  margin-bottom: 12px;
}

.section-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  display: inline-block;
  margin-bottom: 4px;
}

.self-evaluation-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin: 0;
}

/* 技能区域 */
.skills-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-pill {
  font-size: 11px;
  padding: 3px 9px;
  background-color: var(--color-bg-surface-300);
  color: var(--color-text-secondary);
  border-radius: 9999px;
  font-family: var(--font-mono);
  transition: all 0.15s ease;
}

.candidate-card:hover .skill-pill {
  background-color: var(--color-bg-surface-400);
}

.more-count {
  font-size: 11px;
  padding: 3px 9px;
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 2px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 14px;
  font-family: var(--font-sans);
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.page-btn:hover {
  background-color: var(--color-bg-surface-300);
  color: var(--color-text-primary);
}

.page-btn.active {
  background-color: var(--color-text-primary);
  color: var(--color-text-inverse);
}

.page-ellipsis {
  min-width: 32px;
  text-align: center;
  color: var(--color-text-tertiary);
}

.icon-xs { width: 14px; height: 14px; flex-shrink: 0; }

/* 响应式：平板及以下变回顶部筛选 */
@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .filter-sidebar {
    position: static;
  }

  .sidebar-inner {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px 16px;
  }

  .sidebar-header {
    grid-column: 1 / -1;
    margin-bottom: 0;
    padding-bottom: 8px;
  }

  .filter-group {
    margin-bottom: 0;
  }

  .sidebar-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    margin-top: 8px;
    margin-bottom: 0;
    padding-top: 12px;
  }

  .btn-full {
    flex: 1;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .card-header {
    flex-direction: column;
  }

  .card-actions {
    flex-direction: row;
    width: 100%;
  }

  .card-actions .btn {
    flex: 1;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-stats {
    text-align: left;
  }
}

@media (max-width: 640px) {
  .candidate-search-page {
    padding: 32px 0 60px;
  }

  .container-layout {
    padding: 0 16px;
  }

  .page-title {
    font-size: 26px;
    letter-spacing: -0.325px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .sidebar-inner {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-actions {
    width: 100%;
  }

  .card-actions .btn {
    flex: 1;
    justify-content: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .pagination-container {
    flex-wrap: wrap;
  }
}
</style>
