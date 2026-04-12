<template>
  <div class="candidate-search-page animate-fade-in">
    <div class="container-cursor">
      <div class="page-header-v2">
        <div class="header-left">
          <h1 class="text-display text-3xl mb-2">牛人搜索</h1>
          <p class="text-body-serif text-tertiary">在简历库中主动发掘优秀人才，找到适合您职位的牛人。</p>
        </div>
      </div>

      <!-- 筛选区 -->
      <div class="filters-card card mb-8">
        <div class="filters-grid">
          <div class="filter-item">
            <label class="filter-label text-mono">工作城市</label>
            <input
              v-model="filters.city"
              type="text"
              class="input"
              placeholder="例如：北京、上海（支持模糊匹配）"
              @input="handleFilterChange"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label text-mono">最低学历</label>
            <select v-model="filters.minDegree" class="input" @change="handleFilterChange">
              <option value="">不限</option>
              <option value="大专">大专及以上</option>
              <option value="本科">本科及以上</option>
              <option value="硕士">硕士及以上</option>
              <option value="博士">博士</option>
            </select>
          </div>
          <div class="filter-item">
            <label class="filter-label text-mono">技能关键词</label>
            <input
              v-model="filters.skillsInput"
              type="text"
              class="input"
              placeholder="例如：Vue  React TypeScript（空格分隔）"
              @input="handleFilterChange"
            />
            <div v-if="parsedSkills.length > 0" class="skill-preview">
              <span v-for="skill in parsedSkills" :key="skill" class="skill-tag">
                {{ skill }}
              </span>
            </div>
          </div>
          <div class="filter-item">
            <label class="filter-label text-mono">专业关键词</label>
            <input
              v-model="filters.major"
              type="text"
              class="input"
              placeholder="例如：计算机 软件工程"
              @input="handleFilterChange"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label text-mono">最低 AI 评分</label>
            <select v-model="filters.minAiScore" class="input" @change="handleFilterChange">
              <option :value="0">不限</option>
              <option :value="60">60 分以上</option>
              <option :value="70">70 分以上</option>
              <option :value="80">80 分以上</option>
            </select>
          </div>
          <div class="filter-item">
            <label class="filter-label text-mono">排序方式</label>
            <select v-model="filters.sortBy" class="input" @change="handleFilterChange">
              <option value="ai_score">AI 评分降序</option>
              <option value="created_at">最新发布</option>
            </select>
          </div>
        </div>
        <div class="filters-actions mt-4 flex items-center justify-between">
          <div class="text-mono text-sm text-tertiary" v-if="total > 0">
            共找到 <span class="text-primary">{{ total }}</span> 位候选人
          </div>
          <div class="flex">
            <button class="btn btn-ghost mr-2" @click="handleReset">重置筛选</button>
            <button class="btn btn-primary" @click="handleSearch">
              <SearchIcon class="icon-sm mr-2" /> 搜索
            </button>
          </div>
        </div>
      </div>

      <!-- 候选人列表 -->
      <div v-if="resumes.length > 0" class="candidates-list">
        <div
          v-for="item in resumes"
          :key="item.id"
          class="candidate-card card card-hover"
        >
          <div class="candidate-main">
            <div class="candidate-avatar">
              <div class="avatar-placeholder">{{ getInitial(item.basic_info.name) }}</div>
            </div>
            <div class="candidate-info">
              <div class="candidate-header">
                <h3 class="candidate-name text-display">{{ item.basic_info.name }}</h3>
                <div class="candidate-title text-tertiary">{{ item.title }}</div>
                <div class="ai-score-badge" :style="{ backgroundColor: getScoreBg(item.ai_score) }">
                  AI {{ item.ai_score }}
                </div>
              </div>
              <div class="candidate-meta text-mono mt-2">
                <span>{{ item.basic_info.city }}</span>
                <span class="separator">·</span>
                <span>{{ item.basic_info.age }} 岁</span>
                <span class="separator">·</span>
                <span>{{ item.basic_info.phone }}</span>
                <span class="separator">·</span>
                <span>{{ item.experience.length }} 份工作经历</span>
              </div>
              <div v-if="item.skills && item.skills.length > 0" class="candidate-skills mt-3">
                <span
                  v-for="skill in item.skills.slice(0, 10)"
                  :key="skill"
                  class="skill-tag"
                >
                  {{ skill }}
                </span>
                <span v-if="item.skills.length > 10" class="skill-more">
                  +{{ item.skills.length - 10 }}
                </span>
              </div>
            </div>
          </div>

          <div class="candidate-actions">
            <router-link
              :to="`/resume/view/${item.user_id}`"
              target="_blank"
              class="btn btn-secondary btn-sm"
            >
              查看简历 <ExternalLinkIcon class="icon-xs ml-1" />
            </router-link>
            <button
              class="btn btn-primary btn-sm ml-2"
              @click="startChat(item)"
            >
              <MessageSquareIcon class="icon-xs mr-1" /> 发起聊天
            </button>
          </div>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-state card">
        <div class="loading-spinner"></div>
        <p class="text-body-serif text-tertiary mt-4">正在搜索简历...</p>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && resumes.length === 0" class="empty-state-v2 card">
        <div class="icon-box-v2 mb-6">
          <SearchIcon class="icon-xl" />
        </div>
        <h3 class="text-display text-xl mb-2">未找到候选人</h3>
        <p class="text-body-serif text-tertiary mb-8">尝试调整筛选条件，或清空筛选重新搜索。</p>
        <button class="btn btn-primary" @click="handleReset">清空筛选</button>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination">
        <button
          class="btn btn-ghost"
          :disabled="page === 1"
          @click="goToPage(page - 1)"
        >
          上一页
        </button>
        <div class="pagination-pages">
          <button
            v-for="p in visiblePages"
            :key="p"
            :class="['pagination-page', p === page ? 'active' : '']"
            @click="goToPage(p)"
          >
            {{ p }}
          </button>
        </div>
        <button
          class="btn btn-ghost"
          :disabled="page >= totalPages"
          @click="goToPage(page + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCandidateResumes, ensureConversation } from '@/lib/database'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useToast } from '@/composables/useToast'
import type { Resume, Profile } from '@/types'
import {
  Search as SearchIcon,
  ExternalLink as ExternalLinkIcon,
  MessageSquare as MessageSquareIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
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
  if (score >= 80) return 'rgba(31, 138, 101, 0.1)'
  if (score >= 60) return 'rgba(192, 133, 50, 0.1)'
  return 'rgba(207, 45, 86, 0.1)'
}

let debounceTimer: number | null = null
function handleFilterChange() {
  // Debounce auto-search
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    page.value = 1
    loadCandidates()
  }, 500)
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
  padding: 60px 0 120px;
  background-color: var(--color-bg-canvas);
  min-height: calc(100vh - 80px);
}

.page-header-v2 {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}

.filters-card {
  padding: 24px 32px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
}

.skill-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.skill-preview .skill-tag {
  font-size: 10px;
  padding: 2px 6px;
  background-color: rgba(245, 78, 0, 0.1);
  color: #f54e00;
  border-radius: var(--radius-pill);
}

.filters-actions {
  display: flex;
  padding-top: 8px;
}

.candidates-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.candidate-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  padding: 24px 32px;
}

.candidate-main {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.candidate-avatar {
  flex-shrink: 0;
}

.avatar-placeholder {
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

.candidate-info {
  flex: 1;
}

.candidate-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.candidate-name {
  font-size: 18px;
}

.candidate-title {
  font-size: 14px;
  font-family: var(--font-body);
}

.ai-score-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  color: var(--color-text-primary);
}

.candidate-meta {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.separator {
  margin: 0 8px;
  opacity: 0.3;
}

.candidate-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-tag {
  font-size: 11px;
  padding: 2px 8px;
  background-color: var(--color-bg-surface-300);
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
}

.skill-more {
  font-size: 11px;
  padding: 2px 8px;
  color: var(--color-text-tertiary);
}

.candidate-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.loading-state {
  padding: 60px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state-v2 {
  padding: 80px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-box-v2 {
  width: 80px;
  height: 80px;
  background: var(--color-bg-surface-300);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 48px;
}

.pagination-pages {
  display: flex;
  gap: 4px;
}

.pagination-page {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-page:hover {
  background-color: var(--color-bg-surface-300);
  color: var(--color-text-primary);
}

.pagination-page.active {
  background-color: var(--color-primary);
  color: white;
}

@media (max-width: 768px) {
  .candidate-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .candidate-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>
