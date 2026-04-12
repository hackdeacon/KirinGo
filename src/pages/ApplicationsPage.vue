<template>
  <div class="applications-page">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">📋 {{ isRecruiter ? '收到的简历' : '投递记录' }}</h1>
        <p class="page-desc">{{ isRecruiter ? '管理求职者投递的简历' : '跟踪您的求职进度' }}</p>
      </div>

      <!-- 状态筛选 -->
      <div class="status-tabs animate-fade-in">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          class="status-tab"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- 投递列表 -->
      <div class="application-list" v-if="filteredApplications.length">
        <div
          v-for="app in filteredApplications"
          :key="app.id"
          class="application-card card card-hover"
        >
          <div class="app-left">
            <!-- 职位信息 -->
            <div class="app-job-info">
              <router-link :to="`/jobs/${app.job_id}`" class="app-job-title">
                {{ app.job?.title || '未知职位' }}
              </router-link>
              <div class="app-company">
                <span class="company-logo-sm">{{ app.job?.company?.name?.charAt(0) || 'C' }}</span>
                <span>{{ app.job?.company?.name || '未知公司' }}</span>
                <span class="app-salary">{{ app.job?.salary_min }}-{{ app.job?.salary_max }}K</span>
              </div>
            </div>

            <!-- 投递时间和状态 -->
            <div class="app-meta">
              <span class="app-time">投递于 {{ formatDate(app.created_at) }}</span>
              <span :class="['tag', getStatusTag(app.status).color]">
                {{ getStatusTag(app.status).label }}
              </span>
            </div>

            <!-- AI匹配分数 -->
            <div class="app-match" v-if="app.ai_match_score">
              <div class="match-mini-bar">
                <div class="match-mini-fill" :style="{ width: app.ai_match_score + '%' }" :class="getMatchBarClass(app.ai_match_score)"></div>
              </div>
              <span class="match-mini-text">AI匹配 {{ app.ai_match_score }}%</span>
            </div>
          </div>

          <div class="app-right">
            <!-- 进度时间轴 -->
            <div class="progress-timeline">
              <div class="progress-step" :class="{ active: true }">
                <div class="progress-dot"></div>
                <span class="progress-label">已投递</span>
              </div>
              <div class="progress-line" :class="{ active: isStepActive(app.status, 1) }"></div>
              <div class="progress-step" :class="{ active: isStepActive(app.status, 1) }">
                <div class="progress-dot"></div>
                <span class="progress-label">已查看</span>
              </div>
              <div class="progress-line" :class="{ active: isStepActive(app.status, 2) }"></div>
              <div class="progress-step" :class="{ active: isStepActive(app.status, 2) }">
                <div class="progress-dot"></div>
                <span class="progress-label">面试</span>
              </div>
              <div class="progress-line" :class="{ active: isStepActive(app.status, 3) }"></div>
              <div class="progress-step" :class="{ active: isStepActive(app.status, 3) }">
                <div class="progress-dot"></div>
                <span class="progress-label">Offer</span>
              </div>
            </div>

            <!-- 操作 -->
            <div class="app-actions">
              <button class="btn btn-outline btn-sm" @click="startConversation(app)">💬 沟通</button>
              <button
                v-if="!isRecruiter && app.status === 'pending'"
                class="btn btn-ghost btn-sm"
                @click="withdrawApp(app.id)"
              >
                撤回
              </button>
              <template v-if="isRecruiter">
                <button class="btn btn-primary btn-sm" @click="updateStatus(app.id, 'interview')">邀面试</button>
                <button class="btn btn-primary btn-sm" @click="updateStatus(app.id, 'offer')">发Offer</button>
                <button class="btn btn-ghost btn-sm" @click="updateStatus(app.id, 'rejected')">不合适</button>
              </template>
              <template v-if="!isRecruiter && app.status === 'offer'">
                <button class="btn btn-primary btn-sm text-success" @click="handleOfferResponse(app.id, true)">接受</button>
                <button class="btn btn-ghost btn-sm text-danger" @click="handleOfferResponse(app.id, false)">拒绝</button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state card">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-title">{{ loading ? '加载中...' : (isRecruiter ? '暂无收到的简历' : '暂无投递记录') }}</div>
        <div class="empty-state-desc">{{ isRecruiter ? '发布职位后，求职者的投递将出现在这里' : '去浏览职位并投递吧' }}</div>
        <router-link to="/jobs" class="btn btn-primary" style="margin-top: 16px">
          {{ isRecruiter ? '发布职位' : '浏览职位' }}
        </router-link>
      </div>
    </div>

    <!-- Offer 成功祝福弹窗 -->
    <transition name="offer-modal">
      <div v-if="showOfferModal" class="offer-modal-overlay" @click="closeOfferModal">
        <div class="offer-modal-content" @click.stop>
          <div class="offer-confetti">🎉</div>
          <h2 class="offer-title">恭喜发出 Offer！</h2>
          <p class="offer-desc">
            已经成功向候选人发出 Offer<br>
            期待候选人顺利加入，携手共赢
          </p>
          <div class="offer-stars">
            <span v-for="i in 5" :key="i" class="star">⭐</span>
          </div>
          <button class="btn btn-primary mt-6" @click="closeOfferModal">完成</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { applicationStatusMap } from '@/constants/applications'
import {
  ensureConversation,
  fetchApplications,
  updateApplicationStatus as saveApplicationStatus,
} from '@/lib/database'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { Application, ApplicationStatus } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const isRecruiter = computed(() => authStore.isRecruiter)
const activeTab = ref('all')
const loading = ref(false)
const applications = ref<Application[]>([])
const showOfferModal = ref(false)
const showOfferAcceptModal = ref(false)

const statusTabs = computed(() => [
  { label: '全部', value: 'all', count: applications.value.length },
  { label: '待查看', value: 'pending', count: applications.value.filter(a => a.status === 'pending').length },
  { label: '已查看', value: 'viewed', count: applications.value.filter(a => a.status === 'viewed').length },
  { label: '面试', value: 'interview', count: applications.value.filter(a => a.status === 'interview').length },
  { label: 'Offer', value: 'offer', count: applications.value.filter(a => a.status === 'offer').length },
])

const filteredApplications = computed(() => {
  if (activeTab.value === 'all') return applications.value
  return applications.value.filter(a => a.status === activeTab.value)
})

function getStatusTag(status: string) {
  return applicationStatusMap[status] || { label: status, color: 'tag-gray' }
}

function getMatchBarClass(score: number) {
  if (score >= 80) return 'bar-high'
  if (score >= 60) return 'bar-mid'
  return 'bar-low'
}

function isStepActive(status: string, step: number): boolean {
  const order: Record<string, number> = {
    pending: 0,
    viewed: 1,
    interview: 2,
    offer: 3,
    rejected: 1,
    withdrawn: 0,
  }
  return (order[status] || 0) >= step
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

async function loadApplications() {
  if (!authStore.user) return

  loading.value = true
  try {
    applications.value = await fetchApplications(authStore.user.id, authStore.user.role)
  } catch (error: any) {
    toast.error(`加载投递记录失败：${error?.message || '请稍后重试'}`)
  } finally {
    loading.value = false
  }
}

async function withdrawApp(appId: string) {
  await updateStatus(appId, 'withdrawn')
}

function closeOfferModal() {
  showOfferModal.value = false
}

function closeOfferAcceptModal() {
  showOfferAcceptModal.value = false
}

async function handleOfferResponse(appId: string, accepted: boolean) {
  const status = accepted ? 'offer' : 'rejected'
  const app = applications.value.find(a => a.id === appId)
  if (!app) return

  try {
    await saveApplicationStatus(appId, status as ApplicationStatus)
    app.status = status as ApplicationStatus
    if (accepted) {
      toast.success('恭喜你接受了 Offer！')
      showOfferAcceptModal.value = true
    } else {
      toast.success('你已拒绝了 Offer')
    }
  } catch (error: any) {
    toast.error(`更新状态失败：${error?.message || '请稍后重试'}`)
  }
}

async function updateStatus(appId: string, status: ApplicationStatus) {
  const app = applications.value.find(a => a.id === appId)
  if (!app) return

  try {
    await saveApplicationStatus(appId, status)
    app.status = status
    toast.success(`已更新状态为：${applicationStatusMap[status]?.label}`)
    // 如果是 HR 发出 Offer，显示仪式感动画弹窗
    if (status === 'offer' && isRecruiter.value) {
      showOfferModal.value = true
    }
  } catch (error: any) {
    toast.error(`更新状态失败：${error?.message || '请稍后重试'}`)
  }
}

async function startConversation(app: Application) {
  try {
    const conversation = await ensureConversation({
      jobId: app.job_id,
      jobseekerId: app.user_id,
      recruiterId: app.recruiter_id,
    })
    router.push(`/chat/${conversation.id}`)
  } catch (error: any) {
    toast.error(`创建会话失败：${error?.message || '请稍后重试'}`)
  }
}

onMounted(() => {
  loadApplications()
})
</script>

<style scoped>
.applications-page {
  padding: 60px 0 120px;
  background-color: var(--color-bg-canvas);
  min-height: calc(100vh - 80px);
}

.page-container {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header { margin-bottom: 40px; }
.page-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 400;
  line-height: 1.10;
  letter-spacing: -0.72px;
  color: var(--color-text-primary);
}
.page-desc {
  font-family: var(--font-serif);
  font-size: 17.28px;
  font-weight: 400;
  line-height: 1.35;
  color: var(--color-text-secondary);
  margin-top: 12px;
}

/* 状态标签页 */
.status-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.status-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill); /* Pill shaped */
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  letter-spacing: -0.224px;
}

.status-tab:hover { background: rgba(0, 0, 0, 0.05); }

.status-tab.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.tab-count {
  font-size: 12px;
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-weight: 600;
  letter-spacing: -0.12px;
}

.status-tab:not(.active) .tab-count {
  background: rgba(0,0,0,0.05);
  color: var(--color-text-tertiary);
}

/* 投递卡片 */
.application-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.application-card {
  display: flex;
  gap: 32px;
  padding: 28px 32px;
  background-color: var(--color-bg-surface-200);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-cursor-elevated);
  transition: transform 0.2s, box-shadow 0.2s;
}

.application-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: rgba(0, 0, 0, 0.14) 0px 28px 70px, rgba(0, 0, 0, 0.1) 0px 14px 32px, oklab(0.263084 -0.00230259 0.0124794 / 0.1) 0px 0px 0px 1px;
}


.app-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-job-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 400;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: opacity 0.2s;
  line-height: 1.2;
  letter-spacing: -0.11px;
}

.app-job-title:hover { opacity: 0.8; }

.app-company {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--color-text-secondary);
  letter-spacing: -0.224px;
}

.company-logo-sm {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: #000000;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
}

.app-salary {
  color: var(--color-primary);
  font-weight: 600;
}

.app-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-time {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--color-text-tertiary);
  letter-spacing: -0.224px;
}

/* AI匹配条 */
.app-match {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.match-mini-bar {
  width: 100px;
  height: 6px;
  background: var(--color-bg-hover);
  border-radius: 3px;
  overflow: hidden;
}

.match-mini-fill {
  height: 100%;
  border-radius: 3px;
}

.bar-high { background: var(--color-success); }
.bar-mid { background: var(--color-warning); }
.bar-low { background: var(--color-danger); }

.match-mini-text {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 400;
  letter-spacing: -0.224px;
}

/* 右侧 */
.app-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}

/* 进度 */
.progress-timeline {
  display: flex;
  align-items: center;
  gap: 0;
  margin-top: 8px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-bg-hover);
  border: 2px solid var(--color-border);
  transition: all 0.3s;
}

.progress-step.active .progress-dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.progress-label {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
  letter-spacing: -0.12px;
}

.progress-step.active .progress-label {
  color: var(--color-primary);
  font-weight: 600;
}

.progress-line {
  width: 32px;
  height: 2px;
  background: var(--color-border);
  margin-top: -24px;
}

.progress-line.active {
  background: var(--color-primary);
}

.app-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: transparent;
  box-shadow: none;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 24px;
  opacity: 0.8;
}

.empty-state-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  line-height: 1.14;
  letter-spacing: 0.196px;
  margin-bottom: 12px;
}

.empty-state-desc {
  font-family: var(--font-sans);
  font-size: 17px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .applications-page {
    padding: 20px 0 80px;
  }
  .application-card {
    flex-direction: column;
    padding: 24px;
  }

  .app-right {
    align-items: flex-start;
  }

  .progress-timeline {
    align-self: center;
    margin: 16px 0;
  }
}

/* Offer 祝福弹窗 */
.offer-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.offer-modal-content {
  background: var(--color-bg-surface-200);
  border-radius: 16px;
  padding: 48px 32px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-cursor-elevated);
  animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.offer-confetti {
  font-size: 64px;
  animation: bounce 1s ease infinite;
  margin-bottom: 16px;
}

.offer-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.offer-desc {
  font-family: var(--font-serif);
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.offer-stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 24px 0;
}

.offer-stars .star {
  font-size: 24px;
  animation: twinkle 2s ease-in-out infinite;
}

.offer-stars .star:nth-child(1) { animation-delay: 0s; }
.offer-stars .star:nth-child(2) { animation-delay: 0.3s; }
.offer-stars .star:nth-child(3) { animation-delay: 0.6s; }
.offer-stars .star:nth-child(4) { animation-delay: 0.9s; }
.offer-stars .star:nth-child(5) { animation-delay: 1.2s; }

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes twinkle {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
    opacity: 1;
  }
}

.offer-modal-enter-active,
.offer-modal-leave-active {
  transition: all 0.3s ease;
}

.offer-modal-enter-from {
  opacity: 0;
}

.offer-modal-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .offer-modal-content {
    padding: 32px 24px;
  }

  .offer-confetti {
    font-size: 48px;
  }

  .offer-title {
    font-size: 24px;
  }
}
</style>
