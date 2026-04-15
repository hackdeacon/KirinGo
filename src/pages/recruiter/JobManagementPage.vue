<template>
  <div class="job-management-page animate-fade-in">
    <div class="container-cursor">
      <div class="page-header-v2">
        <div class="header-left">
          <h1 class="text-display text-3xl mb-2">职位管理</h1>
          <p class="text-body-serif text-tertiary">管理您发布的招聘岗位，查看投递与活跃状态。</p>
        </div>
        <div class="header-actions">
          <router-link to="/recruiter/jobs/post" class="btn btn-primary">
            <PlusIcon class="icon-xs mr-2" /> 发布新职位
          </router-link>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filters-bar mb-6">
        <div class="search-box">
          <SearchIcon class="search-icon icon-xs" />
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="搜索职位名称..."
          />
        </div>
        <div class="sort-select">
          <label class="text-mono text-sm">排序：</label>
          <select v-model="sortBy" class="input-sm">
            <option value="created_at_desc">最新发布</option>
            <option value="created_at_asc">最早发布</option>
            <option value="view_count_desc">浏览量降序</option>
            <option value="applications_desc">投递数降序</option>
          </select>
        </div>
      </div>

      <!-- 状态筛选 -->
      <div class="tabs-v2 mb-8">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-item-v2"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span class="tab-count text-mono" v-if="getTabCount(tab.value)">{{ getTabCount(tab.value) }}</span>
        </button>
      </div>

      <!-- 加载骨架屏 -->
      <div v-if="loading" class="jobs-list-v2">
        <div v-for="i in 3" :key="i" class="job-manage-card card skeleton-card">
          <div class="skeleton-main">
            <div class="skeleton-title"></div>
            <div class="skeleton-meta"></div>
          </div>
          <div class="skeleton-stats">
            <div class="skeleton-stat"></div>
            <div class="skeleton-stat"></div>
          </div>
          <div class="skeleton-actions">
            <div class="skeleton-btn"></div>
            <div class="skeleton-btn"></div>
          </div>
        </div>
      </div>

      <!-- 职位列表 -->
      <div v-else-if="filteredJobs.length" class="jobs-list-v2">
        <div v-for="job in filteredJobs" :key="job.id" class="job-manage-card card card-hover">
          <div class="job-main-info">
            <div class="job-title-row">
              <h3 class="job-title text-display">{{ job.title }}</h3>
              <span
                :class="['status-tag clickable', job.status]"
                @click="toggleJobStatus(job)"
              >
                <CheckIcon v-if="togglingId === job.id" class="icon-xxs animate-pulse" />
                <template v-else>{{ statusMap[job.status] }}</template>
              </span>
            </div>
            <div class="job-meta text-mono">
              <span>{{ job.city }}{{ job.district ? ` · ${job.district}` : '' }}</span>
              <span class="separator">·</span>
              <span>{{ job.salary_min }}-{{ job.salary_max }}K</span>
              <span class="separator">·</span>
              <span>{{ job.job_type }}</span>
              <span class="separator">·</span>
              <span>{{ job.experience }}</span>
            </div>
            <div class="job-date text-mono text-xs text-tertiary mt-2">
              发布于 {{ formatDate(job.created_at) }}
            </div>
          </div>

          <div class="job-stats-row">
            <div class="stat-item">
              <span class="stat-val text-mono">{{ job.view_count || 0 }}</span>
              <span class="stat-lab">浏览量</span>
            </div>
            <div class="stat-item">
              <span class="stat-val text-mono">{{ applicationCounts.get(job.id) || 0 }}</span>
              <span class="stat-lab">投递数</span>
            </div>
          </div>

          <div class="job-actions-v2">
            <router-link :to="`/recruiter/jobs/edit/${job.id}`" class="btn btn-ghost btn-sm">
              <EditIcon class="icon-xxs mr-1" /> 编辑
            </router-link>
            <button class="btn btn-ghost btn-sm text-danger" @click="handleDelete(job.id)">
              <TrashIcon class="icon-xxs mr-1" /> 删除
            </button>
            <router-link :to="`/jobs/${job.id}`" class="btn btn-secondary btn-sm" target="_blank">
              预览 <ExternalLinkIcon class="icon-xxs ml-1" />
            </router-link>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state-v2 card">
        <div class="icon-box-v2 mb-6">
          <BriefcaseIcon class="icon-xl" />
        </div>
        <h3 class="text-display text-xl mb-2">{{ emptyStateTitle }}</h3>
        <p class="text-body-serif text-tertiary mb-8">{{ emptyStateDescription }}</p>
        <router-link to="/recruiter/jobs/post" class="btn btn-primary">
          立即发布职位
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { fetchRecruiterJobs, deleteJob, countJobApplicationsBulk, updateJobStatus } from '@/lib/database'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { Job } from '@/types'
import {
  Plus as PlusIcon,
  Edit2 as EditIcon,
  Trash2 as TrashIcon,
  ExternalLink as ExternalLinkIcon,
  Briefcase as BriefcaseIcon,
  Search as SearchIcon,
  Check as CheckIcon,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const toast = useToast()

const jobs = ref<Job[]>([])
const loading = ref(true)
const activeTab = ref('all')
const searchQuery = ref('')
const sortBy = ref('created_at_desc')
const applicationCounts = ref(new Map<string, number>())
const togglingId = ref<string | null>(null)

const tabs = [
  { label: '全部', value: 'all' },
  { label: '招聘中', value: 'active' },
  { label: '已关闭', value: 'closed' },
  { label: '草稿', value: 'draft' },
]

const statusMap: Record<string, string> = {
  active: '招聘中',
  closed: '已关闭',
  draft: '草稿',
}

// 搜索过滤
const filteredAndSortedJobs = computed(() => {
  let result = jobs.value

  // 按标签过滤
  if (activeTab.value !== 'all') {
    result = result.filter(j => j.status === activeTab.value)
  }

  // 按关键词搜索
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(j =>
      j.title.toLowerCase().includes(query) ||
      (j.city && j.city.toLowerCase().includes(query))
    )
  }

  // 排序
  result = [...result].sort((a, b) => {
    switch (sortBy.value) {
      case 'created_at_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'created_at_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'view_count_desc':
        return (b.view_count || 0) - (a.view_count || 0)
      case 'applications_desc':
        return (applicationCounts.value.get(b.id) || 0) - (applicationCounts.value.get(a.id) || 0)
      default:
        return 0
    }
  })

  return result
})

const filteredJobs = filteredAndSortedJobs

function getTabCount(status: string) {
  if (status === 'all') return jobs.value.length
  return jobs.value.filter(j => j.status === status).length
}

const emptyStateTitle = computed(() => {
  if (loading.value) return ''
  if (searchQuery.value) return '未找到匹配的职位'
  if (activeTab.value !== 'all') return `没有${statusMap[activeTab.value]}的职位`
  return '暂无职位'
})

const emptyStateDescription = computed(() => {
  if (loading.value) return ''
  if (searchQuery.value) return '试试换个关键词搜索吧'
  if (activeTab.value !== 'all') return '当前分类下没有职位'
  return '您还没有发布过任何职位，现在就开始招贤纳士吧。'
})

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

async function loadJobs() {
  if (!authStore.user?.id) return
  loading.value = true
  try {
    jobs.value = await fetchRecruiterJobs(authStore.user.id)

    // 批量统计投递数
    if (jobs.value.length > 0) {
      const jobIds = jobs.value.map(j => j.id)
      applicationCounts.value = await countJobApplicationsBulk(jobIds)
    }
  } catch (error: any) {
    toast.error('获取职位列表失败')
  } finally {
    loading.value = false
  }
}

async function toggleJobStatus(job: Job) {
  if (togglingId.value) return
  togglingId.value = job.id
  try {
    const newStatus: Job['status'] = job.status === 'active' ? 'closed' : 'active'
    await updateJobStatus(job.id, newStatus)
    job.status = newStatus
    toast.success(`职位状态已更新为 ${statusMap[newStatus]}`)
  } catch (error: any) {
    toast.error('状态切换失败: ' + error.message)
  } finally {
    togglingId.value = null
  }
}

async function handleDelete(id: string) {
  if (!confirm('确定要删除该职位吗？删除后不可恢复。所有相关的投递记录也会被移除。')) return

  try {
    await deleteJob(id)
    jobs.value = jobs.value.filter(j => j.id !== id)
    applicationCounts.value.delete(id)
    toast.success('职位已删除')
  } catch (error: any) {
    toast.error('删除失败')
  }
}

watch([() => authStore.user?.id], () => {
  loadJobs()
})

onMounted(loadJobs)
</script>

<style scoped>
.job-management-page {
  padding: 60px 0 120px;
  background-color: var(--color-bg-canvas);
  min-height: calc(100vh - 80px);
}

.page-header-v2 {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  gap: 24px;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
  padding: 16px 20px;
  background: var(--color-bg-surface-200);
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-radius: 10px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 420px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-radius: 8px;
  background: var(--color-bg-canvas);
  font-size: 14px;
  color: var(--color-text-primary);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: oklab(0.263084 -0.00230259 0.0124794 / 0.25);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}

.sort-select {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.sort-select label {
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.input-sm {
  padding: 10px 14px;
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-radius: 8px;
  background: var(--color-bg-canvas);
  font-size: 14px;
  color: var(--color-text-primary);
  min-width: 160px;
}

.tabs-v2 {
  display: flex;
  gap: 36px;
  border-bottom: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  margin-bottom: 28px;
}

.tab-item-v2 {
  padding: 14px 0;
  font-family: var(--font-display);
  font-size: 15px;
  color: var(--color-text-tertiary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: none;
  border: none;
}

.tab-item-v2:hover {
  color: var(--color-text-primary);
}

.tab-item-v2.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-primary);
}

.tab-count {
  font-size: 11px;
  background: var(--color-bg-surface-300);
  padding: 2px 8px;
  border-radius: 9999px;
  opacity: 0.8;
  min-width: 18px;
  text-align: center;
}

.jobs-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.job-manage-card {
  display: grid;
  grid-template-columns: 2.5fr 1fr 1.2fr;
  align-items: center;
  gap: 40px;
  padding: 28px 32px;
  transition: all 0.2s;
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  background: var(--color-bg-surface-100);
}

.card-hover:hover {
  box-shadow: rgba(0, 0, 0, 0.12) 0px 18px 40px;
  border-color: oklab(0.263084 -0.00230259 0.0124794 / 0.2);
  transform: translateY(-2px);
}

.job-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}

.job-title {
  font-size: 20px;
  letter-spacing: -0.11px;
  line-height: 1.3;
}

.status-tag {
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 9999px;
  transition: all 0.2s;
  font-weight: 500;
}

.status-tag.clickable {
  cursor: pointer;
}

.status-tag.clickable:hover {
  opacity: 0.85;
  transform: scale(1.05);
}

.status-tag.active { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
.status-tag.closed { background: rgba(107, 114, 128, 0.12); color: #4b5563; }
.status-tag.draft { background: rgba(245, 158, 11, 0.12); color: #d97706; }

.job-meta {
  font-size: 13px;
  color: var(--color-text-tertiary);
  line-height: 1.4;
}

.separator {
  margin: 0 10px;
  opacity: 0.35;
}

.text-tertiary {
  color: var(--color-text-tertiary);
}

.text-xs {
  font-size: 12px;
}

.mt-2 {
  margin-top: 10px;
}

.job-stats-row {
  display: flex;
  gap: 40px;
  justify-content: center;
  padding: 8px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
}

.stat-val {
  font-size: 22px;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.stat-lab {
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  margin-top: 6px;
  letter-spacing: 0.048px;
}

.job-actions-v2 {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.job-actions-v2 .btn {
  padding: 8px 16px;
}

.empty-state-v2 {
  padding: 80px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  background: var(--color-bg-surface-100);
  border-radius: 10px;
}

.icon-box-v2 {
  width: 88px;
  height: 88px;
  background: var(--color-bg-surface-300);
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
}

/* Skeleton */
.skeleton-card {
  background: var(--color-bg-surface-200);
}

.skeleton-main {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.skeleton-title {
  height: 26px;
  width: 60%;
  background: var(--color-bg-surface-300);
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-meta {
  height: 16px;
  width: 40%;
  background: var(--color-bg-surface-300);
  border-radius: 3px;
  animation: pulse 1.5s ease-in-out infinite 0.2s;
}

.skeleton-stats {
  display: flex;
  gap: 40px;
}

.skeleton-stat {
  width: 60px;
  height: 36px;
  background: var(--color-bg-surface-300);
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite 0.3s;
}

.skeleton-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.skeleton-btn {
  width: 70px;
  height: 32px;
  background: var(--color-bg-surface-300);
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite 0.4s;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.3; }
}

/* Icon sizes */
.icon-xxs { width: 10px; height: 10px; }
.icon-xs { width: 12px; height: 12px; }
.icon-sm { width: 16px; height: 16px; }

@media (max-width: 1200px) {
  .job-manage-card {
    grid-template-columns: 2fr 1fr 1.2fr;
    gap: 32px;
  }
}

@media (max-width: 1024px) {
  .job-manage-card {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .job-stats-row {
    justify-content: flex-start;
    padding-left: 0;
  }
  .page-header-v2 {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }
  .search-box {
    max-width: 100%;
  }
  .sort-select {
    justify-content: flex-start;
  }
  .job-actions-v2 {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .job-management-page {
    padding: 40px 0 100px;
  }
  .page-header-v2 {
    margin-bottom: 28px;
  }
  .filters-bar {
    padding: 12px;
    gap: 12px;
  }
  .job-actions-v2 {
    flex-wrap: wrap;
  }
  .job-manage-card {
    padding: 20px 16px;
    gap: 20px;
  }
  .job-stats-row {
    gap: 28px;
  }
  .stat-val {
    font-size: 20px;
  }
}
</style>
