<template>
  <div class="interview-page">
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">🎙️ AI 模拟面试</h1>
          <p class="page-desc">选择目标职位，AI面试官帮您提前准备</p>
        </div>
      </div>

      <!-- 未开始面试 -->
      <div v-if="!interviewStarted" class="start-section animate-fade-in-up">
        <!-- 选择职位 -->
        <div class="card select-card">
          <h3 class="card-heading">选择面试职位</h3>

          <div class="job-select-mode">
            <label class="mode-radio">
              <input type="radio" value="existing" v-model="jobSelectMode">
              <span>从我的职位中选择</span>
            </label>
            <label class="mode-radio">
              <input type="radio" value="custom" v-model="jobSelectMode">
              <span>自定义面试职位</span>
            </label>
          </div>

          <div v-if="jobSelectMode === 'existing'">
            <div class="job-select-grid" v-if="availableJobs.length">
              <button
                v-for="job in availableJobs"
                :key="job.id"
                class="job-select-btn"
                :class="{ selected: selectedJobId === job.id }"
                @click="selectedJobId = job.id"
              >
                <div class="job-select-title">{{ job.title }}</div>
                <div class="job-select-company">{{ job.company?.name }}</div>
              </button>
            </div>
            <div v-else class="empty-jobs">
              <p class="empty-jobs-text">您还没有发布过职位，可以使用自定义职位功能开始面试</p>
            </div>
          </div>

          <div v-if="jobSelectMode === 'custom'" class="custom-job-form">
            <div class="form-group">
              <label class="form-label">职位名称</label>
              <input v-model="customJobTitle" class="input" placeholder="例如：前端开发工程师" />
            </div>
            <div class="form-group">
              <label class="form-label">职位描述/要求</label>
              <textarea v-model="customJobDescription" class="input" rows="4" placeholder="简要描述这个职位的主要职责和要求..."></textarea>
            </div>
          </div>
        </div>

        <!-- 面试设置 -->
        <div class="card settings-card">
          <h3 class="card-heading">面试设置</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <label class="form-label">面试类型</label>
              <select v-model="interviewType" class="select" id="interview-type">
                <option value="technical">技术面试</option>
                <option value="behavioral">行为面试</option>
                <option value="comprehensive">综合面试</option>
              </select>
            </div>
            <div class="setting-item">
              <label class="form-label">难度等级</label>
              <select v-model="difficulty" class="select" id="interview-difficulty">
                <option value="easy">初级</option>
                <option value="medium">中级</option>
                <option value="hard">高级</option>
              </select>
            </div>
          </div>
          <button
            class="btn btn-primary btn-lg btn-block"
            @click="startInterview"
            :disabled="!canStartInterview"
            id="start-interview-btn"
          >
            🎯 开始模拟面试
          </button>
        </div>

        <!-- 历史面试 -->
        <div class="card history-card" v-if="pastInterviews.length">
          <h3 class="card-heading">历史面试记录</h3>
          <div class="history-list">
            <div v-for="interview in pastInterviews" :key="interview.id" class="history-item" @click="viewHistory(interview)">
              <div class="history-info">
                <div class="history-title">{{ interview.job_title }}</div>
                <div class="history-date">{{ formatDate(interview.created_at) }}</div>
              </div>
              <div class="history-score" :class="getScoreClass(interview.ai_score)">
                {{ interview.ai_score }}分
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 面试进行中 -->
      <div v-else class="interview-room animate-fade-in">
        <!-- 面试头部 -->
        <div class="interview-header card">
          <div class="interview-info">
            <span class="interview-badge tag-success">面试进行中</span>
            <span class="interview-job">{{ currentJobTitle }}</span>
          </div>
          <button class="btn btn-ghost btn-sm" @click="endInterview" id="end-interview-btn">
            结束面试
          </button>
        </div>

        <!-- 聊天区域 -->
        <div class="chat-area card" ref="chatArea">
          <div v-for="(msg, i) in chatMessages" :key="i"
            class="chat-message"
            :class="{ 'is-ai': msg.role === 'ai', 'is-user': msg.role === 'user' }"
          >
            <div class="msg-avatar">
              {{ msg.role === 'ai' ? '🤖' : '👤' }}
            </div>
            <div class="msg-bubble">
              <div class="msg-role">{{ msg.role === 'ai' ? 'AI 面试官' : '我' }}</div>
              <div class="msg-content">{{ msg.content }}</div>
            </div>
          </div>

          <!-- AI 正在输入 -->
          <div v-if="aiTyping" class="chat-message is-ai">
            <div class="msg-avatar">🤖</div>
            <div class="msg-bubble">
              <div class="msg-role">AI 面试官</div>
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area card" v-if="!interviewEnded">
          <textarea
            v-model="userInput"
            class="input chat-input"
            placeholder="请输入您的回答..."
            @keydown.enter="handleKeyDown"
            rows="3"
            id="interview-input"
          ></textarea>
          <div class="input-actions">
            <span class="input-hint">按 Enter 发送，Ctrl + Enter 换行</span>
            <button class="btn btn-primary" @click="sendAnswer" :disabled="!userInput.trim() || aiTyping" id="send-answer-btn">
              发送回答
            </button>
          </div>
        </div>

        <!-- 面试结束 - 反馈 -->
        <div v-if="interviewEnded" class="feedback-card card animate-fade-in-up">
          <h3 class="feedback-title">📊 面试评估报告</h3>
          <div class="feedback-score-row">
            <div class="feedback-score-circle">
              <span class="feedback-score-value">{{ feedback.score }}</span>
              <span class="feedback-score-label">综合评分</span>
            </div>
            <div class="feedback-dims">
              <div class="feedback-dim">
                <span class="dim-label">沟通表达</span>
                <div class="dim-bar-track"><div class="dim-bar" :style="{ width: feedback.communication + '%' }"></div></div>
                <span class="dim-value">{{ feedback.communication }}</span>
              </div>
              <div class="feedback-dim">
                <span class="dim-label">技术能力</span>
                <div class="dim-bar-track"><div class="dim-bar" :style="{ width: feedback.technical + '%' }"></div></div>
                <span class="dim-value">{{ feedback.technical }}</span>
              </div>
              <div class="feedback-dim">
                <span class="dim-label">项目经验</span>
                <div class="dim-bar-track"><div class="dim-bar" :style="{ width: feedback.experience + '%' }"></div></div>
                <span class="dim-value">{{ feedback.experience }}</span>
              </div>
            </div>
          </div>
          <div class="feedback-summary">
            <h4>总体评价</h4>
            <p>{{ feedback.overall }}</p>
          </div>
          <div class="feedback-sections">
            <div class="feedback-section strengths">
              <h4>✅ 面试亮点</h4>
              <ul>
                <li v-for="(item, i) in feedback.strengths" :key="i">{{ item }}</li>
              </ul>
            </div>
            <div class="feedback-section improvements">
              <h4>🔧 改进建议</h4>
              <ul>
                <li v-for="(item, i) in feedback.improvements" :key="i">{{ item }}</li>
              </ul>
            </div>
          </div>
          <div class="feedback-actions">
            <button class="btn btn-primary" @click="resetInterview">再面试一次</button>
            <button class="btn btn-ghost" @click="resetInterview">返回</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { createInterview, fetchInterviews, fetchUserResume, updateInterview } from '@/lib/database'
import { invokeEdgeFunction } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { useJobStore } from '@/stores/jobs'
import { useToast } from '@/composables/useToast'
import type { Interview, InterviewMessage } from '@/types'

const authStore = useAuthStore()
const jobStore = useJobStore()
const toast = useToast()

const availableJobs = computed(() => jobStore.jobs)
const pastInterviews = ref<Interview[]>([])
const jobSelectMode = ref<'existing' | 'custom'>('existing')
const selectedJobId = ref('')
const customJobTitle = ref('')
const customJobDescription = ref('')
const interviewType = ref('technical')
const difficulty = ref('medium')
const interviewStarted = ref(false)
const interviewEnded = ref(false)
const aiTyping = ref(false)
const userInput = ref('')
const chatArea = ref<HTMLElement>()
const chatMessages = ref<InterviewMessage[]>([])
const currentJobTitle = ref('')
const currentJobDescription = ref('')
const currentInterviewId = ref('')

const canStartInterview = computed(() => {
  if (jobSelectMode.value === 'existing') {
    return !!selectedJobId.value
  } else {
    return !!customJobTitle.value.trim()
  }
})

const feedback = ref({
  score: 0,
  communication: 0,
  technical: 0,
  experience: 0,
  overall: '',
  strengths: [] as string[],
  improvements: [] as string[],
})

async function loadData() {
  if (!authStore.user) return

  try {
    await jobStore.fetchJobs()
    pastInterviews.value = await fetchInterviews(authStore.user.id)
  } catch (error: any) {
    toast.error(`加载面试数据失败：${error?.message || '请稍后重试'}`)
  }
}

async function startInterview() {
  if (!authStore.user) return

  let jobTitle: string
  let jobDescription: string
  let fullTitle: string

  if (jobSelectMode.value === 'existing') {
    const job = availableJobs.value.find(item => item.id === selectedJobId.value)
    if (!job) return
    jobTitle = job.title
    jobDescription = job.description
    fullTitle = `${job.title} - ${job.company?.name || ''}`
  } else {
    jobTitle = customJobTitle.value.trim()
    jobDescription = customJobDescription.value.trim()
    fullTitle = customJobTitle.value.trim()
  }

  try {
    const resume = await fetchUserResume(authStore.user.id)
    const interview = await createInterview({
      userId: authStore.user.id,
      jobId: jobSelectMode.value === 'existing' ? selectedJobId.value : null,
      jobTitle: fullTitle,
    })
    const result = await invokeEdgeFunction<{ message: string }>('interviewAI', {
      action: 'start',
      jobTitle,
      jobDescription,
      interviewType: interviewType.value,
      difficulty: difficulty.value,
      resume,
    })

    currentInterviewId.value = interview.id
    interviewStarted.value = true
    interviewEnded.value = false
    currentJobTitle.value = fullTitle
    currentJobDescription.value = jobDescription
    chatMessages.value = [{ role: 'ai', content: result.message }]
    await updateInterview(interview.id, { messages: chatMessages.value })
    scrollToBottom()
  } catch (error: any) {
    toast.error(`开始面试失败：${error?.message || '请稍后重试'}`)
  }
}

async function sendAnswer() {
  if (!userInput.value.trim() || aiTyping.value || !currentInterviewId.value) return

  const userMessage = { role: 'user' as const, content: userInput.value.trim() }
  chatMessages.value.push(userMessage)
  userInput.value = ''
  scrollToBottom()

  try {
    aiTyping.value = true
    await updateInterview(currentInterviewId.value, { messages: chatMessages.value })

    let jobTitle: string
    let jobDescription: string
    if (jobSelectMode.value === 'existing') {
      const job = availableJobs.value.find(item => item.id === selectedJobId.value)
      jobTitle = job?.title || currentJobTitle.value
      jobDescription = job?.description || currentJobDescription.value
    } else {
      jobTitle = customJobTitle.value.trim()
      jobDescription = customJobDescription.value.trim()
    }

    const resume = authStore.user ? await fetchUserResume(authStore.user.id) : null
    const result = await invokeEdgeFunction<{ message: string }>('interviewAI', {
      action: 'continue',
      jobTitle,
      jobDescription,
      messages: chatMessages.value,
      resume,
      interviewType: interviewType.value,
      difficulty: difficulty.value,
    })

    chatMessages.value.push({ role: 'ai', content: result.message })
    await updateInterview(currentInterviewId.value, { messages: chatMessages.value })
    scrollToBottom()
  } catch (error: any) {
    toast.error(`继续面试失败：${error?.message || '请稍后重试'}`)
  } finally {
    aiTyping.value = false
  }
}

async function endInterview() {
  if (!currentInterviewId.value || !authStore.user) return

  try {
    const result = await invokeEdgeFunction<{ feedback: typeof feedback.value }>('interviewAI', {
      action: 'end',
      jobTitle: currentJobTitle.value,
      messages: chatMessages.value,
    })

    feedback.value = {
      ...result.feedback,
      strengths: result.feedback.strengths || [],
      improvements: result.feedback.improvements || [],
    }
    interviewEnded.value = true
    await updateInterview(currentInterviewId.value, {
      messages: chatMessages.value,
      ai_feedback: feedback.value,
      ai_score: feedback.value.score,
      status: 'completed',
    })
    pastInterviews.value = await fetchInterviews(authStore.user.id)
  } catch (error: any) {
    toast.error(`生成面试报告失败：${error?.message || '请稍后重试'}`)
  }
}

function resetInterview() {
  currentInterviewId.value = ''
  currentJobTitle.value = ''
  currentJobDescription.value = ''
  selectedJobId.value = ''
  customJobTitle.value = ''
  customJobDescription.value = ''
  interviewEnded.value = false
  interviewStarted.value = false
  chatMessages.value = []
}

function viewHistory(interview: Interview) {
  interviewStarted.value = true
  interviewEnded.value = true
  currentInterviewId.value = interview.id
  currentJobTitle.value = interview.job_title
  chatMessages.value = interview.messages || []
  feedback.value = {
    score: interview.ai_score,
    communication: interview.ai_feedback.communication || 0,
    technical: interview.ai_feedback.technical || 0,
    experience: interview.ai_feedback.experience || 0,
    overall: interview.ai_feedback.overall || '',
    strengths: interview.ai_feedback.strengths || [],
    improvements: interview.ai_feedback.improvements || [],
  }
}

function handleKeyDown(event: KeyboardEvent) {
  // Ctrl/Cmd + Enter: insert newline
  if (event.ctrlKey || event.metaKey) {
    // Let the default behavior insert newline
    return
  }
  // Enter: send
  event.preventDefault()
  sendAnswer()
}

function scrollToBottom() {
  nextTick(() => {
    if (chatArea.value) {
      chatArea.value.scrollTop = chatArea.value.scrollHeight
    }
  })
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN')
}

function getScoreClass(score: number) {
  if (score >= 80) return 'score-high'
  if (score >= 60) return 'score-mid'
  return 'score-low'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.interview-page {
  padding: 40px 0;
  background-color: var(--color-bg-canvas);
  min-height: calc(100vh - 60px);
}

.page-container {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 22px;
}

.page-header { margin-bottom: 32px; }

.page-title {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 600;
  letter-spacing: -0.5px;
  line-height: 1.10;
  margin-bottom: 8px;
}

.page-desc {
  font-family: var(--font-sans);
  font-size: 17px;
  color: var(--color-text-secondary);
  letter-spacing: -0.374px;
}

.card-heading {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  letter-spacing: -0.224px;
}

/* 职位选择 */
.select-card, .settings-card, .history-card {
  padding: 32px;
  margin-bottom: 24px;
  background-color: var(--color-bg-panel);
  border-radius: var(--radius-xl);
  box-shadow: none;
  border: none;
}

.job-select-mode {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}

.mode-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 15px;
  color: var(--color-text-primary);
}

.mode-radio input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.custom-job-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

.empty-jobs {
  padding: 32px;
  text-align: center;
  background: var(--color-bg-surface-300);
  border-radius: var(--radius-md);
}

.empty-jobs-text {
  color: var(--color-text-tertiary);
  font-size: 15px;
}

.job-select-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.job-select-btn {
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.job-select-btn:hover { background-color: rgba(0, 0, 0, 0, 0.02); }
.job-select-btn.selected {
  border-color: var(--color-primary);
  background: rgba(0, 113, 227, 0.05);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.job-select-title {
  font-family: var(--font-sans);
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 6px;
  letter-spacing: -0.374px;
}

.job-select-company {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--color-text-tertiary);
  letter-spacing: -0.224px;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
}

.form-label {
  display: block;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
  letter-spacing: -0.224px;
}

.select {
  border-radius: var(--radius-md);
  padding: 12px 16px;
  background-color: var(--color-bg-canvas);
  border: 1px solid var(--color-border);
}

/* 历史记录 */
.history-list { display: flex; flex-direction: column; gap: 12px; }

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.history-item:hover { background: rgba(0,0,0,0.02); }
.history-title {
  font-family: var(--font-sans);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.374px;
}
.history-date {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin-top: 4px;
  letter-spacing: -0.224px;
}

.history-score {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  letter-spacing: -0.224px;
}

.score-high { color: #34c759; background: rgba(52, 199, 89, 0.1); }
.score-mid { color: #ff9f0a; background: rgba(255, 159, 10, 0.1); }
.score-low { color: #ff3b30; background: rgba(255, 59, 48, 0.1); }

/* 面试室 */
.interview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  margin-bottom: 24px;
  background-color: var(--color-bg-panel);
  border-radius: var(--radius-xl);
  box-shadow: none;
}

.interview-info { display: flex; align-items: center; gap: 12px; }
.interview-badge {
  font-family: var(--font-sans);
  font-size: 12px;
  padding: 4px 12px;
  font-weight: 600;
  border-radius: var(--radius-full);
}
.interview-job {
  font-family: var(--font-sans);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.374px;
}

/* 聊天区域 */
.chat-area {
  padding: 32px 24px;
  max-height: 500px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 24px;
  background-color: var(--color-bg-panel);
  border-radius: var(--radius-xl);
  box-shadow: none;
}

.chat-message {
  display: flex;
  gap: 16px;
  animation: fadeIn 0.3s ease-out;
}

.chat-message.is-user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-bg-canvas);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.is-user .msg-avatar { background: var(--color-bg-canvas); }

.msg-bubble {
  max-width: 75%;
  padding: 16px;
  border-radius: 18px;
  background: var(--color-bg-canvas);
}

.is-ai .msg-bubble { border-bottom-left-radius: 4px; }
.is-user .msg-bubble {
  background: var(--color-primary);
  color: white;
  border: none;
  border-bottom-right-radius: 4px;
}

.msg-role {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  opacity: 0.6;
  letter-spacing: -0.12px;
}

.msg-content {
  font-family: var(--font-sans);
  font-size: 17px;
  line-height: 1.5;
  letter-spacing: -0.374px;
}

/* 打字动画 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 4px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-tertiary);
  animation: typing 1.4s infinite both;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* 输入区域 */
.input-area {
  padding: 24px;
  background-color: var(--color-bg-panel);
  border-radius: var(--radius-xl);
  box-shadow: none;
}

.chat-input {
  min-height: 80px;
  resize: none;
  margin-bottom: 16px;
  border-radius: var(--radius-lg);
  padding: 16px;
  font-family: var(--font-sans);
  font-size: 17px;
  background-color: var(--color-bg-canvas);
}

.input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.input-hint {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--color-text-tertiary);
  letter-spacing: -0.224px;
}

/* 反馈 */
.feedback-card {
  padding: 40px;
  margin-top: 24px;
  background-color: var(--color-bg-panel);
  border-radius: var(--radius-xl);
  box-shadow: none;
}

.feedback-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 32px;
  text-align: center;
  letter-spacing: 0.196px;
}

.feedback-score-row {
  display: flex;
  align-items: center;
  gap: 48px;
  justify-content: center;
  margin-bottom: 32px;
}

.feedback-score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--color-bg-dark);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feedback-score-value {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 600;
  letter-spacing: -0.5px;
}
.feedback-score-label {
  font-family: var(--font-sans);
  font-size: 14px;
  opacity: 0.8;
  margin-top: 4px;
}

.feedback-dims { flex: 1; display: flex; flex-direction: column; gap: 16px; }

.feedback-dim {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dim-label {
  width: 80px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}
.dim-bar-track { flex: 1; height: 8px; background: var(--color-border); border-radius: 4px; overflow: hidden; }
.dim-bar { height: 100%; background: var(--color-primary); border-radius: 4px; transition: width 1s ease; }
.dim-value {
  width: 40px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  text-align: right;
}

.feedback-summary {
  padding: 24px;
  background: var(--color-bg-canvas);
  border-radius: var(--radius-lg);
  margin-bottom: 32px;
}

.feedback-summary h4 {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -0.374px;
}
.feedback-summary p {
  font-family: var(--font-sans);
  font-size: 17px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  letter-spacing: -0.374px;
}

.feedback-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.feedback-section {
  padding: 24px;
  border-radius: var(--radius-md);
}

.feedback-section h4 {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 16px;
  letter-spacing: -0.374px;
}

.feedback-section.strengths {
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.feedback-section.improvements {
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.feedback-section ul {
  margin: 0;
  padding-left: 20px;
}

.feedback-section li {
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.feedback-section li:last-child {
  margin-bottom: 0;
}

.feedback-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

@media (max-width: 768px) {
  .job-select-grid { grid-template-columns: 1fr; }
  .settings-grid { grid-template-columns: 1fr; }
  .feedback-score-row { flex-direction: column; gap: 24px; }
  .feedback-sections { grid-template-columns: 1fr; }
  .interview-page { padding: 20px 0; }
}
</style>
