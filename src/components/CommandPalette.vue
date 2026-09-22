<template>
  <transition name="palette-fade">
    <div v-if="isOpen" class="palette-overlay" @click.self="close">
      <div class="palette-box card" role="dialog" aria-modal="true">
        <!-- 搜索输入栏 -->
        <div class="palette-input-wrapper">
          <SearchIcon class="search-icon icon-sm" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="palette-input"
            placeholder="输入页面、职位名称或命令... (↑↓ 选择，Enter 执行，Esc 退出)"
            @keydown.down.prevent="navigateNext"
            @keydown.up.prevent="navigatePrev"
            @keydown.enter.prevent="executeActive"
            @keydown.esc="close"
          />
          <kbd class="kbd-badge text-mono">ESC</kbd>
        </div>

        <!-- 结果列表 -->
        <div class="palette-results" ref="listRef">
          <!-- 职位匹配组 -->
          <div v-if="matchedJobs.length" class="result-group">
            <div class="group-title text-mono">MATCHED JOBS ({{ matchedJobs.length }})</div>
            <div
              v-for="(item, idx) in matchedJobs"
              :key="`job-${item.id}`"
              class="result-item"
              :class="{ 'is-selected': activeIndex === idx }"
              @click="selectItem(item)"
              @mouseenter="activeIndex = idx"
            >
              <BriefcaseIcon class="item-icon icon-xs" />
              <div class="item-info">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-sub text-mono">{{ item.company?.name }} · {{ item.salary_min }}-{{ item.salary_max }}K</span>
              </div>
              <span class="item-tag text-mono text-tiny">{{ item.city }}</span>
            </div>
          </div>

          <!-- 系统指令组 -->
          <div v-if="matchedActions.length" class="result-group">
            <div class="group-title text-mono">QUICK ACTIONS & NAVIGATION</div>
            <div
              v-for="(item, idx) in matchedActions"
              :key="`act-${item.id}`"
              class="result-item"
              :class="{ 'is-selected': activeIndex === (matchedJobs.length + idx) }"
              @click="selectItem(item)"
              @mouseenter="activeIndex = (matchedJobs.length + idx)"
            >
              <component :is="item.icon" class="item-icon icon-xs" />
              <div class="item-info">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-sub text-serif">{{ item.subtitle }}</span>
              </div>
              <kbd v-if="item.shortcut" class="item-kbd text-mono text-tiny">{{ item.shortcut }}</kbd>
            </div>
          </div>

          <!-- 无匹配结果 -->
          <div v-if="!matchedJobs.length && !matchedActions.length" class="empty-results">
            <p class="text-body-serif text-tertiary">未找到与 "{{ query }}" 相关的页面或职位</p>
          </div>
        </div>

        <!-- 底部快捷操作提示 -->
        <div class="palette-footer">
          <div class="footer-hint text-mono text-tiny">
            <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
            <span><kbd>↵</kbd> 跳转</span>
            <span><kbd>ESC</kbd> 关闭</span>
          </div>
          <div class="footer-brand text-mono text-tiny">KIRINGO COMMAND</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '@/stores/jobs'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useAIConfigStore } from '@/stores/aiConfig'
import { useToast } from '@/composables/useToast'
import {
  Search as SearchIcon,
  Briefcase as BriefcaseIcon,
  Home as HomeIcon,
  Compass as CompassIcon,
  Zap as ZapIcon,
  FileText as FileTextIcon,
  Mic as MicIcon,
  MessageSquare as MessageSquareIcon,
  User as UserIcon,
  Users as UsersIcon,
  Plus as PlusIcon,
  Settings as SettingsIcon,
  Moon as MoonIcon,
  Sparkles as SparklesIcon,
} from 'lucide-vue-next'

const router = useRouter()
const jobStore = useJobStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const aiConfig = useAIConfigStore()
const toast = useToast()

const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement>()
const listRef = ref<HTMLDivElement>()

interface CommandItem {
  id: string
  title: string
  subtitle: string
  icon: any
  action: () => void
  shortcut?: string
}

// 静态动作集
const actions = computed<CommandItem[]>(() => [
  {
    id: 'home',
    title: '首页',
    subtitle: '返回 KirinGo 官方门户首页',
    icon: HomeIcon,
    action: () => router.push('/'),
  },
  {
    id: 'jobs',
    title: '职位库 / 找工作',
    subtitle: '探索海量互联网与技术前沿职位',
    icon: CompassIcon,
    action: () => router.push('/jobs'),
  },
  {
    id: 'interview',
    title: 'AI 模拟面试',
    subtitle: '针对目标职位进行多轮全真模拟面试',
    icon: MicIcon,
    action: () => router.push('/interview'),
    shortcut: 'AI',
  },
  {
    id: 'resume',
    title: '我的简历',
    subtitle: '查看、编辑与打印您的专业简历',
    icon: FileTextIcon,
    action: () => router.push('/resume'),
  },
  {
    id: 'resume-optimize',
    title: 'AI 简历深度优化',
    subtitle: '使用大模型诊断并优化简历描述',
    icon: ZapIcon,
    action: () => router.push('/resume/ai-optimize'),
    shortcut: 'AI',
  },
  {
    id: 'candidates',
    title: '牛人搜索',
    subtitle: '招聘方主动发掘海量优秀人才',
    icon: UsersIcon,
    action: () => router.push('/recruiter/candidates'),
  },
  {
    id: 'post-job',
    title: '发布新职位',
    subtitle: '创建新岗位并开启 AI 智能候选人匹配',
    icon: PlusIcon,
    action: () => router.push('/recruiter/jobs/post'),
  },
  {
    id: 'chat',
    title: '即时沟通 / 消息中心',
    subtitle: '查看会话并与求职者/HR 在线交流',
    icon: MessageSquareIcon,
    action: () => router.push('/chat'),
  },
  {
    id: 'profile',
    title: '个人中心',
    subtitle: '查看与修改个人资料、系统偏好',
    icon: UserIcon,
    action: () => router.push('/profile'),
  },
  {
    id: 'ai-engine-settings',
    title: 'AI 引擎与 API Key 设置',
    subtitle: '自定义前台大模型接口地址与密钥',
    icon: SparklesIcon,
    action: () => aiConfig.openSettings(),
    shortcut: 'PRO',
  },
  {
    id: 'toggle-theme',
    title: '切换深色 / 浅色模式',
    subtitle: `当前模式: ${themeStore.mode}，点击在浅色/深色间切换`,
    icon: MoonIcon,
    action: () => {
      themeStore.setMode(themeStore.effectiveMode === 'dark' ? 'light' : 'dark')
      toast.info(`已切换至 ${themeStore.effectiveMode === 'dark' ? '深色' : '浅色'} 模式`)
    },
  },
])

// 职位匹配
const matchedJobs = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return jobStore.jobs
    .filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company?.name?.toLowerCase().includes(q) ||
        job.tags?.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, 5)
})

// 动作匹配
const matchedActions = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return actions.value
  return actions.value.filter(
    (a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
  )
})

const totalItemsCount = computed(
  () => matchedJobs.value.length + matchedActions.value.length
)

function open() {
  isOpen.value = true
  query.value = ''
  activeIndex.value = 0
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function close() {
  isOpen.value = false
}

function navigateNext() {
  if (totalItemsCount.value === 0) return
  activeIndex.value = (activeIndex.value + 1) % totalItemsCount.value
}

function navigatePrev() {
  if (totalItemsCount.value === 0) return
  activeIndex.value =
    (activeIndex.value - 1 + totalItemsCount.value) % totalItemsCount.value
}

function selectItem(item: any) {
  if (item.action) {
    item.action()
  } else if (item.id) {
    // 是职位
    router.push(`/jobs/${item.id}`)
  }
  close()
}

function executeActive() {
  const jobs = matchedJobs.value
  const acts = matchedActions.value
  const idx = activeIndex.value

  if (idx < jobs.length) {
    selectItem(jobs[idx])
  } else if (idx < jobs.length + acts.length) {
    selectItem(acts[idx - jobs.length])
  }
}

// 键盘全局监听 Cmd + K
function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }
}

watch(query, () => {
  activeIndex.value = 0
})

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

defineExpose({ open, close })
</script>

<style scoped>
.palette-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 80px 20px 20px;
}

.palette-box {
  width: 100%;
  max-width: 640px;
  background-color: var(--color-bg-surface-100);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-xl);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.palette-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid var(--color-border);
}

.search-icon {
  color: var(--color-text-tertiary);
}

.palette-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

.palette-input::placeholder {
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.kbd-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--color-bg-surface-300);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.palette-results {
  max-height: 420px;
  overflow-y: auto;
  padding: 12px 8px;
}

.result-group {
  margin-bottom: 16px;
}

.group-title {
  font-size: 10px;
  letter-spacing: 0.15em;
  color: var(--color-text-tertiary);
  padding: 6px 16px 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s;
}

.result-item.is-selected {
  background-color: var(--color-bg-surface-300);
}

.item-icon {
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.result-item.is-selected .item-icon {
  color: var(--color-primary);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-sub {
  font-size: 12px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-tag {
  padding: 2px 8px;
  border-radius: 99px;
  background-color: var(--color-bg-surface-200);
  color: var(--color-text-secondary);
}

.item-kbd {
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(245, 78, 0, 0.1);
  color: var(--color-primary);
  font-weight: 600;
}

.empty-results {
  padding: 48px 24px;
  text-align: center;
}

.palette-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: var(--color-bg-surface-200);
  border-top: 1px solid var(--color-border);
}

.footer-hint {
  display: flex;
  gap: 16px;
  color: var(--color-text-tertiary);
}

.footer-hint kbd {
  display: inline-block;
  padding: 1px 4px;
  background: var(--color-bg-surface-300);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  margin-right: 4px;
}

.footer-brand {
  color: var(--color-text-tertiary);
  opacity: 0.7;
}

.palette-fade-enter-active,
.palette-fade-leave-active {
  transition: opacity 0.2s ease;
}

.palette-fade-enter-from,
.palette-fade-leave-to {
  opacity: 0;
}
</style>
