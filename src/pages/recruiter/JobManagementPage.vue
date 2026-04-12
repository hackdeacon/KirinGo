<template>
  <div class="job-management-page animate-fade-in">
    <div class="container-cursor">
      <div class="page-header-v2">
        <div class="header-left">
          <h1 class="text-display text-3xl mb-2">职位管理</h1>
          <p class="text-body-serif text-tertiary">管理您发布的招聘岗位，查看投递与活跃状态。</p>
        </div>
        <div class="header-actions">
          <router-link to="/recruiter/candidates" class="btn btn-secondary mr-3">
            <SearchIcon class="icon-sm mr-2" /> 搜索牛人
          </router-link>
          <router-link to="/recruiter/jobs/post" class="btn btn-primary">
            <PlusIcon class="icon-sm mr-2" /> 发布新职位
          </router-link>
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

      <!-- 职位列表 -->
      <div class="jobs-list-v2" v-if="filteredJobs.length">
        <div v-for="job in filteredJobs" :key="job.id" class="job-manage-card card card-hover">
          <div class="job-main-info">
            <div class="job-title-row">
              <h3 class="job-title text-display">{{ job.title }}</h3>
              <span :class="['status-tag', job.status]">{{ statusMap[job.status] }}</span>
            </div>
            <div class="job-meta text-mono">
              <span>{{ job.city }}</span>
              <span class="separator">·</span>
              <span>{{ job.salary_min }}-{{ job.salary_max }}K</span>
              <span class="separator">·</span>
              <span>{{ job.experience }}</span>
            </div>
          </div>

          <div class="job-stats-row">
            <div class="stat-item">
              <span class="stat-val text-mono">{{ job.view_count || 0 }}</span>
              <span class="stat-lab">浏览量</span>
            </div>
            <div class="stat-item">
              <span class="stat-val text-mono">--</span>
              <span class="stat-lab">投递数</span>
            </div>
          </div>

          <div class="job-actions-v2">
            <router-link :to="`/recruiter/jobs/edit/${job.id}`" class="btn btn-ghost btn-sm">
              <EditIcon class="icon-xs mr-1" /> 编辑
            </router-link>
            <button class="btn btn-ghost btn-sm text-danger" @click="handleDelete(job.id)">
              <TrashIcon class="icon-xs mr-1" /> 删除
            </button>
            <router-link :to="`/jobs/${job.id}`" class="btn btn-secondary btn-sm" target="_blank">
              预览 <ExternalLinkIcon class="icon-xs ml-1" />
            </router-link>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state-v2 card" v-else>
        <div class="icon-box-v2 mb-6">
          <BriefcaseIcon class="icon-xl" />
        </div>
        <h3 class="text-display text-xl mb-2">暂无职位</h3>
        <p class="text-body-serif text-tertiary mb-8">您还没有发布过任何职位，现在就开始招贤纳士吧。</p>
        <router-link to="/recruiter/jobs/post" class="btn btn-primary">
          立即发布职位
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchRecruiterJobs, deleteJob } from '@/lib/database'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { Job } from '@/types'
import {
  Plus as PlusIcon,
  Edit2 as EditIcon,
  Trash2 as TrashIcon,
  ExternalLink as ExternalLinkIcon,
  Briefcase as BriefcaseIcon,
  Search as SearchIcon
} from 'lucide-vue-next'

const authStore = useAuthStore()
const toast = useToast()

const jobs = ref<Job[]>([])
const loading = ref(true)
const activeTab = ref('all')

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

const filteredJobs = computed(() => {
  if (activeTab.value === 'all') return jobs.value
  return jobs.value.filter(j => j.status === activeTab.value)
})

function getTabCount(status: string) {
  if (status === 'all') return jobs.value.length
  return jobs.value.filter(j => j.status === status).length
}

async function loadJobs() {
  if (!authStore.user?.id) return
  loading.value = true
  try {
    jobs.value = await fetchRecruiterJobs(authStore.user.id)
  } catch (error: any) {
    toast.error('获取职位列表失败')
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: string) {
  if (!confirm('确定要删除该职位吗？删除后不可恢复。')) return
  
  try {
    await deleteJob(id)
    jobs.value = jobs.value.filter(j => j.id !== id)
    toast.success('职位已删除')
  } catch (error: any) {
    toast.error('删除失败')
  }
}

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
  margin-bottom: 48px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.tabs-v2 {
  display: flex;
  gap: 32px;
  border-bottom: 1px solid var(--color-border);
}

.tab-item-v2 {
  padding: 12px 0;
  font-family: var(--font-display);
  font-size: 14px;
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
  font-size: 10px;
  background: var(--color-bg-surface-300);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
  opacity: 0.7;
}

.jobs-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.job-manage-card {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 48px;
  padding: 24px 32px;
}

.job-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.job-title {
  font-size: 18px;
}

.status-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

.status-tag.active { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.status-tag.closed { background: rgba(107, 114, 128, 0.1); color: #6b7280; }
.status-tag.draft { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.job-meta {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.separator {
  margin: 0 8px;
  opacity: 0.3;
}

.job-stats-row {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.stat-val {
  font-size: 18px;
  color: var(--color-text-primary);
}

.stat-lab {
  font-size: 10px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  margin-top: 4px;
}

.job-actions-v2 {
  display: flex;
  gap: 8px;
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

@media (max-width: 1024px) {
  .job-manage-card {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .job-stats-row {
    justify-content: flex-start;
  }
}
</style>
