<template>
  <div class="job-list-page">
    <div class="container-cursor">
      <div class="jobs-layout">
        <!-- 左侧: 筛选器侧边栏 (1/3) -->
        <aside class="filter-sidebar animate-fade-in-up">
          <div class="sidebar-inner">
            <!-- 搜索框 -->
            <div class="filter-section">
              <h3 class="filter-section-title">{{ isRecruiter ? '寻找人才' : '搜索职位' }}</h3>
              <div class="search-bar-v2">
                <SearchIcon class="search-icon" />
                <input
                  v-model="keyword"
                  type="text"
                  class="search-input"
                  :placeholder="isRecruiter ? '搜索人才、技能或岗位...' : '搜索职位、公司或技能...'"
                  @keyup.enter="applyFilters"
                />
                <button class="search-submit-btn" @click="applyFilters">
                  <ArrowRightIcon class="icon-sm" />
                </button>
              </div>
            </div>

            <!-- 热门标签 -->
            <div class="filter-section">
              <h3 class="filter-section-title">热门关键词</h3>
              <div class="hot-tags">
                <button v-for="tag in hotTags" :key="tag" class="tag-pill-sm" @click="searchByTag(tag)">
                  {{ tag }}
                </button>
              </div>
            </div>

            <!-- 筛选条件 - 2x2 grid -->
            <div class="filter-sections-grid">
              <div class="filter-section">
                <h3 class="filter-section-title">工作地点</h3>
                <div class="filter-group">
                  <select v-model="selectedCity" class="filter-select">
                    <option v-for="city in cities" :key="city">{{ city }}</option>
                  </select>
                </div>
              </div>

              <div class="filter-section">
                <h3 class="filter-section-title">工作经验</h3>
                <div class="filter-group">
                  <select v-model="selectedExp" class="filter-select">
                    <option v-for="exp in experienceOptions" :key="exp">{{ exp }}</option>
                  </select>
                </div>
              </div>

              <div class="filter-section">
                <h3 class="filter-section-title">学历要求</h3>
                <div class="filter-group">
                  <select v-model="selectedEdu" class="filter-select">
                    <option v-for="edu in educationOptions" :key="edu">{{ edu }}</option>
                  </select>
                </div>
              </div>

              <div class="filter-section">
                <h3 class="filter-section-title">薪资范围</h3>
                <div class="filter-group">
                  <select v-model="selectedSalary" class="filter-select">
                    <option v-for="s in salaryRanges" :key="s.label" :value="s.label">{{ s.label }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 重置按钮 -->
            <div class="filter-section filter-actions">
              <button class="btn btn-primary w-full" @click="resetFilters">
                <RotateCcwIcon class="icon-xs mr-1" /> 重置筛选
              </button>
            </div>
          </div>
        </aside>

        <!-- 右侧: 职位列表 (2/3) -->
        <main class="job-list-content">
          <!-- 结果信息 -->
          <div class="result-bar animate-fade-in-up">
            <span class="result-count">
              找到 <span class="count-num text-mono">{{ filteredJobs.length }}</span> 个匹配{{ isRecruiter ? '人才' : '职位' }}
            </span>
          </div>

            <!-- 职位列表 -->
            <div class="jobs-grid" v-if="filteredJobs.length">
              <JobCard
                v-for="(job, i) in filteredJobs"
                :key="job.id"
                :job="job"
                class="animate-fade-in-up"
                :style="{ animationDelay: `${(i % 10) * 0.05 + 0.2}s` }"
              />
            </div>

            <!-- 空状态 -->
            <div v-else class="empty-state">
              <div class="empty-state-icon">
                <SearchXIcon class="icon-xl" />
              </div>
              <div class="text-heading mb-3">未找到相关职位</div>
              <p class="text-body-serif mb-8">请尝试调整筛选条件或搜索关键词。</p>
              <button class="btn btn-primary" @click="resetFilters">
                清除所有筛选
              </button>
            </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useJobStore } from '@/stores/jobs'
import { useAuthStore } from '@/stores/auth'
import { salaryRanges } from '@/constants/jobs'
import JobCard from '@/components/JobCard.vue'
import {
  Search as SearchIcon,
  RotateCcw as RotateCcwIcon,
  SearchX as SearchXIcon,
  ArrowRight as ArrowRightIcon,
  MapPin as MapPinIcon,
  Briefcase as BriefcaseIcon,
  GraduationCap as GraduationCapIcon,
  Coins as CoinsIcon
} from 'lucide-vue-next'

const route = useRoute()
const jobStore = useJobStore()
const authStore = useAuthStore()

const isRecruiter = computed(() => authStore.isRecruiter)

const keyword = ref('')
const selectedCity = ref('全部')
const selectedExp = ref('不限')
const selectedEdu = ref('不限')
const selectedSalary = ref('不限')

const hotTags = ['前端开发', 'Java', 'AI 算法', '产品经理', 'Go 语言', '数据分析']

const filteredJobs = computed(() => jobStore.filteredJobs)

function searchByTag(tag: string) {
  keyword.value = tag
  applyFilters()
}
const cities = computed(() => ['全部', ...new Set(jobStore.jobs.map(job => job.city).filter(Boolean))])
const experienceOptions = computed(() => ['不限', ...new Set(jobStore.jobs.map(job => job.experience).filter(Boolean))])
const educationOptions = computed(() => ['不限', ...new Set(jobStore.jobs.map(job => job.education).filter(Boolean))])

function applyFilters() {
  const salary = salaryRanges.find(s => s.label === selectedSalary.value)
  jobStore.setFilters({
    keyword: keyword.value,
    city: selectedCity.value,
    experience: selectedExp.value,
    education: selectedEdu.value,
    salaryMin: salary?.min || 0,
    salaryMax: salary?.max || 999,
  })
}

function resetFilters() {
  keyword.value = ''
  selectedCity.value = '全部'
  selectedExp.value = '不限'
  selectedEdu.value = '不限'
  selectedSalary.value = '不限'
  jobStore.resetFilters()
}

// 监听筛选变化
watch([selectedCity, selectedExp, selectedEdu, selectedSalary], () => {
  applyFilters()
})

onMounted(async () => {
  await jobStore.fetchJobs()

  // 从 store 回显筛选条件
  keyword.value = jobStore.filters.keyword
  selectedCity.value = jobStore.filters.city
  selectedExp.value = jobStore.filters.experience
  selectedEdu.value = jobStore.filters.education

  // 从路由参数获取关键词（覆盖 store）
  if (route.query.keyword) {
    keyword.value = route.query.keyword as string
  }

  // 查找匹配的薪资范围
  const currentMin = jobStore.filters.salaryMin
  const currentMax = jobStore.filters.salaryMax
  const currentSalary = salaryRanges.find(s => s.min === currentMin && s.max === currentMax)
  if (currentSalary) {
    selectedSalary.value = currentSalary.label
  }

  applyFilters()
})
</script>

<style scoped>
.job-list-page {
  padding: 40px 0 100px;
  background-color: var(--color-bg-canvas);
  overflow: visible;
}

.container-cursor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

/* 新布局: 左侧筛选 + 右侧列表 */
.jobs-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 32px;
  align-items: start;
  box-sizing: border-box;
}

/* 左侧筛选侧边栏 - sticky, stays at top when page scrolls */
.filter-sidebar {
  position: sticky;
  top: 88px; /* stick right below the header with small spacing */
  /* natural height, no fixed height */
  align-self: start;
  box-sizing: border-box;
  /* 1px padding prevents shadow clipping */
  padding: 0 1px 1px 0;
}

.sidebar-inner {
  /* natural height, no internal scrolling */
  background: var(--color-bg-surface-100);
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-radius: 10px;
  padding: 24px 20px;
  box-shadow:
    rgba(0, 0, 0, 0.10) 0px 18px 48px,
    oklab(0.263084 -0.00230259 0.0124794 / 0.1) 0px 0px 0px 1px;
}

/* Filter sections arranged in 2x2 grid */
.filter-sections-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 14px;
  margin-bottom: 20px;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-sections-grid .filter-section {
  margin-bottom: 0;
}

.filter-section:last-of-type {
  margin-bottom: 0;
}

.filter-section-title {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  letter-spacing: 0.02px;
}

/* 搜索框在侧边栏 */
.search-bar-v2 {
  display: flex;
  align-items: center;
  background: var(--color-bg-canvas);
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-radius: 8px;
  padding: 8px 8px 8px 12px;
  gap: 10px;
  transition: all 0.2s ease;
}

.search-bar-v2:focus-within {
  border-color: oklab(0.263084 -0.00230259 0.0124794 / 0.2);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}

.search-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--color-text-primary);
  background: transparent;
  font-family: var(--font-sans);
}

.search-submit-btn {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: var(--color-text-primary);
  color: var(--color-bg-canvas);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.search-submit-btn:hover {
  background: var(--color-primary);
  transform: scale(1.02);
}

/* 热门标签 */
.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag-pill-sm {
  padding: 4px 12px;
  font-size: 12px;
  font-family: var(--font-display);
  background: var(--color-bg-canvas);
  color: var(--color-text-tertiary);
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s;
}

.tag-pill-sm:hover {
  border-color: oklab(0.263084 -0.00230259 0.0124794 / 0.25);
  color: var(--color-text-primary);
}

/* 筛选下拉框 */
.filter-group {
  position: relative;
}

.filter-select {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-radius: 8px;
  background: var(--color-bg-canvas);
  font-family: var(--font-display);
  font-size: 13px;
  color: var(--color-text-primary);
  outline: none;
  cursor: pointer;
  appearance: none;
  transition: all 0.15s;
}

.filter-select:hover {
  border-color: oklab(0.263084 -0.00230259 0.0124794 / 0.2);
}

.filter-select:focus {
  border-color: var(--color-primary);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}

.filter-group::after {
  content: '';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 6px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%2326251e' fill-opacity='0.4' d='M1 1l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  pointer-events: none;
}

/* 底部操作区 */
.filter-actions {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 400;
  border-radius: 8px;
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}

.btn-primary {
  background: var(--color-bg-surface-300);
  color: var(--color-text-primary);
}

.btn-primary:hover {
  color: var(--color-error);
  border-color: oklab(0.263084 -0.00230259 0.0124794 / 0.2);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}

.w-full {
  width: 100%;
}

/* 右侧职位列表区域 - natural flow, whole page scrolls */
.job-list-content {
  min-width: 0;
}

.result-bar {
  padding: 0 0 20px;
  margin-bottom: 24px;
  border-bottom: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
}

.result-count {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.count-num {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 16px;
  margin: 0 2px;
}

/* 职位网格 - 单列在右侧更适合阅读 */
.jobs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
}

.empty-state-icon {
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
}

.icon-xl {
  width: 64px;
  height: 64px;
  opacity: 0.2;
  color: var(--color-text-primary);
}

/* Utility classes */
.icon-xs { width: 14px; height: 14px; }
.icon-sm { width: 18px; height: 18px; }
.text-mono { font-family: var(--font-mono); }
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

.mr-1 { margin-right: 4px; }
.mb-3 { margin-bottom: 12px; }
.mb-8 { margin-bottom: 32px; }

/* ========== Responsive Breakpoints ========== */

/* Tablet: stack vertically, whole page scrolls */
@media (max-width: 1024px) {
  .job-list-page {
    height: auto;
    min-height: calc(100vh - 88px);
    overflow: visible;
  }

  .jobs-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .filter-sidebar {
    position: static;
    height: auto;
    padding: 0;
    margin-bottom: 24px;
  }

  .sidebar-inner {
    height: auto;
    overflow-y: visible;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }

  .filter-section {
    margin-bottom: 0;
  }

  .filter-actions {
    margin-bottom: 0;
    padding-top: 0;
    border-top: none;
    align-self: end;
  }

  .job-list-content {
    height: auto;
    overflow-y: visible;
    padding-bottom: 0;
  }

  .jobs-grid {
    grid-template-columns: 1fr;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .job-list-page {
    padding: 24px 0 80px;
    height: auto;
    min-height: calc(100vh - 88px);
    overflow: visible;
  }

  .sidebar-inner {
    grid-template-columns: 1fr;
    padding: 20px 16px;
    gap: 16px;
    height: auto;
    overflow-y: visible;
  }

  .filter-section {
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .filter-section-title {
    margin-bottom: 8px;
  }

  .job-list-content {
    height: auto;
    overflow-y: visible;
    padding-bottom: 0;
  }

  .result-bar {
    padding: 16px 0;
  }

  .empty-state {
    padding: 60px 16px;
  }
}
</style>
