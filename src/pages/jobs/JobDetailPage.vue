<template>
  <div class="job-detail-page" v-if="job">
    <div class="container-cursor">
      <!-- 返回 -->
      <button class="back-btn" @click="$router.back()" id="back-btn">
        <ChevronLeftIcon class="icon-sm" /> 返回职位列表
      </button>

      <div class="detail-layout">
        <!-- 左侧: 职位信息 -->
        <div class="detail-main">
          <!-- 职位头部 -->
          <div class="job-header card animate-fade-in-up">
            <div class="job-header-top">
              <div class="job-title-group">
                <div class="section-tag text-mono">JOB OPPORTUNITY</div>
                <h1 class="job-title">{{ job.title }}</h1>
                <div class="job-meta text-mono">
                  <span class="flex-center"><MapPinIcon class="icon-xs mr-1" /> {{ job.city }} · {{ job.district }}</span>
                  <span class="flex-center"><BriefcaseIcon class="icon-xs mr-1" /> {{ job.experience }}</span>
                  <span class="flex-center"><GraduationCapIcon class="icon-xs mr-1" /> {{ job.education }}</span>
                  <span class="flex-center"><ClockIcon class="icon-xs mr-1" /> {{ job.job_type }}</span>
                </div>
              </div>
              <div class="job-salary-big text-display">{{ job.salary_min }}-{{ job.salary_max }}K</div>
            </div>
            <div class="job-tags-row">
              <span v-for="tag in job.tags" :key="tag" class="skill-tag text-mono">{{ tag }}</span>
            </div>
          </div>

          <!-- AI 匹配分析 -->
          <div class="ai-match-card card animate-fade-in-up" v-if="authStore.isJobseeker && matchScore !== null" style="animation-delay:0.1s">
            <div class="ai-match-header">
              <div class="ai-title-wrapper">
                <ZapIcon class="ai-icon text-orange" />
                <h3 class="text-subheading">AI 匹配分析</h3>
              </div>
              <div class="ai-score-badge" :class="matchClass">
                <span class="score-label text-mono">MATCH SCORE</span>
                <span class="score-value text-display">{{ matchScore }}%</span>
              </div>
            </div>
            <div class="match-bars">
              <div class="match-bar-item" v-for="(dim, key) in matchDimensions" :key="key">
                <div class="match-bar-info">
                  <span class="match-bar-label text-mono">{{ dim.label }}</span>
                  <span class="match-bar-value text-mono">{{ dim.score }}%</span>
                </div>
                <div class="match-bar-track">
                  <div class="match-bar-fill" :style="{ width: dim.score + '%' }" :class="getBarClass(dim.score)"></div>
                </div>
              </div>
            </div>
            <div class="ai-feedback text-serif mt-6">
              <SparklesIcon class="icon-xs text-orange mr-2" />
              <span>AI 评估：您的{{ matchDimensions.skills.score >= 80 ? '技术栈与该职位高度契合' : '部分技能仍有提升空间' }}，{{ hasApplied ? '请保持关注招聘进度。' : '建议立即投递。' }}</span>
            </div>
          </div>

          <!-- 职位描述 -->
          <div class="section-card card animate-fade-in-up" style="animation-delay:0.15s">
            <div class="section-card-header">
              <FileTextIcon class="icon-sm text-tertiary" />
              <h3 class="text-subheading">职位描述</h3>
            </div>
            <div class="content-text text-serif" v-html="formatText(job.description)"></div>
          </div>

          <!-- 任职要求 -->
          <div class="section-card card animate-fade-in-up" style="animation-delay:0.2s">
            <div class="section-card-header">
              <CheckCircleIcon class="icon-sm text-tertiary" />
              <h3 class="text-subheading">任职要求</h3>
            </div>
            <div class="content-text text-serif" v-html="formatText(job.requirements)"></div>
          </div>
        </div>

        <!-- 右侧: 公司 & 操作 -->
        <div class="detail-sidebar">
          <!-- 操作按钮 -->
          <div class="action-card card animate-fade-in-up" style="animation-delay:0.1s">
            <template v-if="authStore.user?.id === job.recruiter_id">
              <router-link :to="`/recruiter/jobs/edit/${job.id}`" class="btn btn-primary btn-lg btn-block">
                <EditIcon class="icon-sm mr-2" /> 编辑此职位
              </router-link>
              <p class="text-tiny text-tertiary mt-4 text-center">您是该职位的发布者</p>
            </template>
            <template v-else>
              <button
                v-if="authStore.isJobseeker"
                class="btn btn-orange btn-lg btn-block"
                :disabled="hasApplied"
                @click="handleApply"
                id="apply-btn"
              >
                <CheckIcon v-if="hasApplied" class="icon-sm mr-2" />
                {{ hasApplied ? '已投递成功' : '立即投递职位' }}
              </button>
              <button
                v-if="authStore.isJobseeker"
                class="btn btn-primary btn-lg btn-block mt-3"
                @click="handleChat"
                id="chat-btn"
              >
                <MessageSquareIcon class="icon-sm mr-2" /> 和 TA 聊聊
              </button>
            </template>
            <div v-if="!authStore.isAuthenticated" class="login-hint card-sm">
              <p class="text-body-serif">登录后即可一键投递并与招聘者在线沟通。</p>
              <router-link to="/auth/login" class="btn btn-primary btn-sm btn-block mt-3">立即登录</router-link>
            </div>
          </div>

          <!-- 公司信息 -->
          <div class="company-card card animate-fade-in-up" style="animation-delay:0.2s">
            <div class="company-header">
              <div class="company-logo-big">
                {{ job.company?.name?.charAt(0) || 'C' }}
              </div>
              <div class="company-title-info">
                <h3 class="company-name-big text-display">{{ job.company?.name }}</h3>
                <p class="company-industry text-mono">{{ job.company?.industry }}</p>
              </div>
            </div>
            <div class="company-details">
              <div class="company-detail-item">
                <span class="detail-label text-mono">SCALE</span>
                <span class="detail-value">{{ job.company?.scale }}</span>
              </div>
              <div class="company-detail-item">
                <span class="detail-label text-mono">STAGE</span>
                <span class="detail-value">{{ job.company?.financing }}</span>
              </div>
              <div class="company-detail-item">
                <span class="detail-label text-mono">ADDR</span>
                <span class="detail-value">{{ job.company?.city }} {{ job.company?.address }}</span>
              </div>
            </div>
            <p class="company-desc text-serif">{{ job.company?.description }}</p>
          </div>

          <!-- 招聘者信息 -->
          <div class="recruiter-card card animate-fade-in-up" style="animation-delay:0.3s" v-if="job.recruiter">
            <div class="recruiter-header">
              <AppAvatar :src="job.recruiter.avatar_url" :alt="job.recruiter.full_name" size="md" />
              <div class="recruiter-info-main">
                <div class="recruiter-name-row">
                  <span class="recruiter-name text-display">{{ job.recruiter.full_name }}</span>
                  <span class="online-dot-pulse"></span>
                </div>
                <div class="recruiter-bio text-body-serif">{{ job.recruiter.bio || '正在招聘中...' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 加载中 -->
  <div v-else class="loading-page">
    <div class="app-loading-spinner"></div>
    <span class="text-mono mt-4">正在加载职位详情...</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createApplication,
  ensureConversation,
  fetchApplicationForJob,
  fetchUserResume,
} from '@/lib/database'
import { callLLMStream, LLM_API_KEY } from '@/lib/llmStream'
import { useJobStore } from '@/stores/jobs'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { AIMatchResult, Resume } from '@/types'
import AppAvatar from '@/components/AppAvatar.vue'
import {
  ChevronLeft as ChevronLeftIcon,
  MapPin as MapPinIcon,
  Briefcase as BriefcaseIcon,
  GraduationCap as GraduationCapIcon,
  Clock as ClockIcon,
  Zap as ZapIcon,
  Sparkles as SparklesIcon,
  FileText as FileTextIcon,
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  MessageSquare as MessageSquareIcon,
  Edit2 as EditIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const jobStore = useJobStore()
const authStore = useAuthStore()
const toast = useToast()

const hasApplied = ref(false)
const matchScore = ref<number | null>(null)
const resume = ref<Resume | null>(null)

const job = computed(() => jobStore.currentJob)

const matchDimensions = ref({
  skills: { label: 'SKILLS', score: 0 },
  experience: { label: 'EXP', score: 0 },
  education: { label: 'EDU', score: 0 },
  location: { label: 'LOC', score: 0 },
})

const matchClass = computed(() => {
  if ((matchScore.value ?? 0) >= 80) return 'score-high'
  if ((matchScore.value ?? 0) >= 60) return 'score-mid'
  return 'score-low'
})

function getBarClass(score: number) {
  if (score >= 80) return 'bar-high'
  if (score >= 60) return 'bar-mid'
  return 'bar-low'
}

function formatText(text: string): string {
  if (!text) return ''
  return text.replace(/\n/g, '<br>')
}

async function analyzeMatch() {
  if (!authStore.user || !job.value) return

  if (!LLM_API_KEY) {
    toast.error('LLM API Key 未配置，请检查 .env 文件 (需要 VITE_CHATANYWHERE_API_KEY 或 VITE_DEEPSEEK_API_KEY 或 VITE_OPENROUTER_API_KEY)')
    matchScore.value = null
    return
  }

  resume.value = await fetchUserResume(authStore.user.id)
  if (!resume.value) {
    matchScore.value = null
    return
  }

  try {
    const systemPrompt = `你是一位专业的 HR，请分析求职者简历与职位的匹配度。请从四个维度评估匹配度并返回 JSON 格式。`

    const userPrompt = `职位信息：
职位名称：${job.value.title}
公司：${job.value.company?.name || ''}
工作地点：${job.value.city || '不限'}
薪资范围：${job.value.salary_min || 0} - ${job.value.salary_max || 0}
要求：${job.value.requirements || ''}
期望经验：${job.value.experience || '不限'}
期望学历：${job.value.education || '不限'}
标签：${job.value.tags?.join(', ') || ''}

求职者简历：
姓名：${resume.value.basic_info?.name || ''}
自我评价：${resume.value.self_evaluation || ''}
工作经历：${JSON.stringify(resume.value.experience || [])}
项目经历：${JSON.stringify(resume.value.projects || [])}
教育经历：${JSON.stringify(resume.value.education || [])}
技能：${resume.value.skills?.join(', ') || ''}

请你从以下四个维度评估匹配度，每个维度给出 0-100 的分数，并计算总分（总分也是 0-100）。
返回 JSON 格式如下：
{
  "score": 总分(0-100),
  "dimensions": {
    "skills": 技能匹配度分数(0-100),
    "experience": 经验匹配度分数(0-100),
    "education": 学历匹配度分数(0-100),
    "location": 地点匹配度分数(0-100)
  }
}`

    const resultText = await callLLMStream(systemPrompt, userPrompt, true)
    const result = JSON.parse(resultText) as AIMatchResult

    matchScore.value = result.score
    matchDimensions.value = {
      skills: { label: 'SKILLS', score: result.dimensions.skills },
      experience: { label: 'EXP', score: result.dimensions.experience },
      education: { label: 'EDU', score: result.dimensions.education },
      location: { label: 'LOC', score: result.dimensions.location },
    }
  } catch (error) {
    console.error('Match analysis error:', error)
    matchScore.value = null
    toast.error(`匹配分析失败：${error instanceof Error ? error.message : '请稍后重试'}`)
  }
}

async function handleApply() {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }

  if (!authStore.user || !job.value) return

  try {
    resume.value = resume.value || await fetchUserResume(authStore.user.id)
    await createApplication({
      jobId: job.value.id,
      userId: authStore.user.id,
      recruiterId: job.value.recruiter_id,
      resumeId: resume.value?.id || null,
    })
    hasApplied.value = true
    toast.success('投递成功！已通过 AI 通道发送简历')
  } catch (error: any) {
    if (error?.code === '23505') {
      hasApplied.value = true
      toast.info('您已经投递过这个职位了')
      return
    }

    toast.error(`投递失败：${error?.message || '请稍后重试'}`)
  }
}

async function handleChat() {
  if (!authStore.isAuthenticated || !authStore.isJobseeker) {
    router.push('/auth/login')
    return
  }

  if (!authStore.user || !job.value) return

  if (authStore.user.id === job.value.recruiter_id) {
    toast.info('这是您自己发布的职位')
    return
  }

  try {
    const conversation = await ensureConversation({
      jobId: job.value.id,
      jobseekerId: authStore.user.id,
      recruiterId: job.value.recruiter_id,
    })
    router.push(`/chat/${conversation.id}`)
  } catch (error: any) {
    toast.error(`创建会话失败：${error?.message || '请稍后重试'}`)
  }
}

onMounted(async () => {
  const id = route.params.id as string
  await jobStore.fetchJobById(id)

  if (authStore.user?.id && authStore.isJobseeker && job.value) {
    hasApplied.value = Boolean(await fetchApplicationForJob(id, authStore.user.id))
    await analyzeMatch()
  }
})
</script>

<style scoped>
.job-detail-page {
  padding: 60px 0 100px;
  background-color: var(--color-bg-canvas);
  min-height: calc(100vh - 48px);
}

.container-cursor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-family: var(--font-display);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 32px;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--color-primary);
}

.detail-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 40px;
  align-items: start;
}

/* 职位头部 */
.job-header {
  padding: 48px;
  background-color: var(--color-bg-surface-200);
  margin-bottom: 32px;
}

.job-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 32px;
}

.job-title-group {
  flex: 1;
}

.section-tag {
  font-size: 10px;
  letter-spacing: 0.15em;
  color: var(--color-text-tertiary);
  margin-bottom: 12px;
}

.job-title {
  font-family: var(--font-display);
  font-size: var(--font-size-heading);
  line-height: var(--leading-heading);
  letter-spacing: var(--tracking-heading);
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.job-meta {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}

.job-salary-big {
  font-size: 36px;
  color: var(--color-text-primary);
  flex-shrink: 0;
  line-height: 1;
}

.job-tags-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 32px;
  border-top: 1px solid var(--color-border);
}

.skill-tag {
  padding: 4px 12px;
  font-size: 11px;
  color: var(--color-text-secondary);
  background: var(--color-bg-surface-300);
  border-radius: var(--radius-pill);
  letter-spacing: var(--tracking-mono);
}

/* AI匹配 */
.ai-match-card {
  padding: 40px;
  margin-bottom: 32px;
  background-color: var(--color-bg-surface-200);
}

.ai-match-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
}

.ai-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-icon {
  width: 24px;
  height: 24px;
}

.ai-score-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.score-label {
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
}

.score-value {
  font-size: 32px;
  line-height: 1;
}

.score-high .score-value { color: var(--color-success); }
.score-mid .score-value { color: #c08532; }
.score-low .score-value { color: var(--color-error); }

.match-bars {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px 40px;
}

.match-bar-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.match-bar-label {
  font-size: 10px;
  color: var(--color-text-tertiary);
}

.match-bar-value {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.match-bar-track {
  height: 4px;
  background: var(--color-bg-surface-400);
  border-radius: 2px;
  overflow: hidden;
}

.match-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.bar-high { background: var(--color-success); }
.bar-mid { background: #c08532; }
.bar-low { background: var(--color-error); }

.ai-feedback {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: var(--color-bg-surface-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

/* 内容卡片 */
.section-card {
  padding: 48px;
  margin-bottom: 32px;
  background-color: var(--color-bg-surface-200);
}

.section-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text-primary);
}

/* 侧边栏 */
.detail-sidebar {
  position: sticky;
  top: 108px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.action-card {
  padding: 32px;
  background-color: var(--color-bg-surface-200);
}

.login-hint {
  padding: 20px;
  background: var(--color-bg-surface-300);
  border-radius: var(--radius-md);
  margin-top: 24px;
  text-align: center;
}

.btn-block { width: 100%; }

/* 公司卡片 */
.company-card {
  padding: 32px;
  background-color: var(--color-bg-surface-200);
}

.company-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.company-logo-big {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background: var(--color-text-primary);
  color: var(--color-bg-canvas);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 24px;
  flex-shrink: 0;
}

.company-name-big {
  font-size: 20px;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.company-industry {
  font-size: 12px;
  color: var(--color-text-tertiary);
  letter-spacing: 0.05em;
}

.company-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.company-detail-item {
  display: flex;
  gap: 16px;
  font-size: 13px;
}

.detail-label {
  color: var(--color-text-tertiary);
  min-width: 50px;
  font-size: 10px;
}

.detail-value {
  color: var(--color-text-secondary);
}

.company-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

/* 招聘者卡片 */
.recruiter-card {
  padding: 24px;
  background-color: var(--color-bg-surface-200);
}

.recruiter-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.recruiter-info-main {
  flex: 1;
}

.recruiter-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.recruiter-name {
  font-size: 16px;
  color: var(--color-text-primary);
}

.recruiter-bio {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.online-dot-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  position: relative;
}

.online-dot-pulse::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 1px solid var(--color-success);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
}

/* 加载 */
.loading-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.flex-center { display: flex; align-items: center; }
.mr-1 { margin-right: 4px; }
.mr-2 { margin-right: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.mb-8 { margin-bottom: 32px; }
.text-orange { color: var(--color-primary); }
.text-tertiary { color: var(--color-text-tertiary); }

@media (max-width: 1024px) {
  .detail-layout { grid-template-columns: 1fr; gap: 32px; }
  .detail-sidebar { position: static; }
  .match-bars { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .job-header, .ai-match-card, .section-card { padding: 32px 24px; }
  .job-header-top { flex-direction: column; gap: 24px; }
  .job-salary-big { font-size: 28px; }
  .job-meta { gap: 16px; }
  .job-title { font-size: 28px; }
}
</style>
