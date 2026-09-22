<template>
  <div class="kirin-copilot-root">
    <!-- 悬浮唤起胶囊 -->
    <transition name="copilot-bubble">
      <button
        v-if="!isOpen"
        class="copilot-floating-pill"
        @click="openCopilot"
        title="唤起 Kirin Copilot AI 智囊"
      >
        <div class="pill-glow-ring"></div>
        <div class="pill-content">
          <SparklesIcon class="copilot-sparkle-icon" />
          <span class="pill-text text-mono">KIRIN COPILOT</span>
          <span class="live-dot"></span>
        </div>
      </button>
    </transition>

    <!-- Copilot 抽屉面板 -->
    <transition name="copilot-drawer">
      <div v-if="isOpen" class="copilot-drawer-panel card" role="complementary">
        <!-- 抽屉头部 -->
        <div class="drawer-header">
          <div class="drawer-title-row">
            <div class="title-with-badge">
              <div class="ai-avatar-icon">
                <SparklesIcon class="icon-xs" />
              </div>
              <div>
                <h3 class="copilot-name">Kirin Copilot</h3>
                <span class="copilot-status text-mono text-tiny">AI CAREER COPILOT</span>
              </div>
            </div>
            <div class="header-actions">
              <button class="action-icon-btn" @click="aiConfig.openSettings" title="配置 AI 引擎">
                <SettingsIcon class="icon-xs" />
              </button>
              <button class="action-icon-btn" @click="clearMessages" title="清空对话">
                <Trash2Icon class="icon-xs" />
              </button>
              <button class="action-icon-btn" @click="isOpen = false" title="最小化">
                <Minimize2Icon class="icon-xs" />
              </button>
            </div>
          </div>

          <!-- 上下文感知栏 -->
          <div class="context-banner text-mono text-tiny">
            <CompassIcon class="icon-xxs mr-1" />
            <span>CONTEXT: {{ currentContextLabel }}</span>
          </div>
        </div>

        <!-- 消息对话区域 -->
        <div class="copilot-messages" ref="msgContainer">
          <!-- 初始欢迎卡片 -->
          <div v-if="messages.length === 0" class="welcome-card animate-fade-in">
            <p class="welcome-desc text-serif">
              我是您的求职全能 AI 智囊。我已同步您当前的页面上下文，您可以直接提问或使用下方的智能速答卡片：
            </p>

            <div class="preset-prompts-grid mt-4">
              <button
                v-for="(prompt, idx) in contextualPrompts"
                :key="idx"
                class="prompt-pill-btn"
                @click="sendPrompt(prompt)"
              >
                <ChevronRightIcon class="icon-xxs mr-1 text-primary" />
                <span>{{ prompt }}</span>
              </button>
            </div>
          </div>

          <!-- 对话消息列表 -->
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="copilot-msg-bubble"
            :class="msg.role"
          >
            <div class="msg-header text-mono text-tiny">
              {{ msg.role === 'user' ? 'YOU' : 'KIRIN COPILOT' }}
            </div>
            <div class="msg-body text-serif" v-html="renderMessage(msg.content)"></div>
            <div v-if="msg.role === 'assistant'" class="msg-actions">
              <button class="copy-btn text-mono text-tiny" @click="copyText(msg.content)">
                <CopyIcon class="icon-xxs mr-1" /> 复制回答
              </button>
            </div>
          </div>

          <!-- 思考中指示器 -->
          <div v-if="isLoading" class="copilot-msg-bubble assistant loading-bubble">
            <div class="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- 快捷操作胶囊条 -->
        <div class="quick-chips-row" v-if="messages.length > 0">
          <button
            v-for="(prompt, idx) in contextualPrompts.slice(0, 2)"
            :key="idx"
            class="chip-tag text-mono"
            @click="sendPrompt(prompt)"
            :disabled="isLoading"
          >
            {{ prompt }}
          </button>
        </div>

        <!-- 底部输入框 -->
        <div class="drawer-footer">
          <div class="input-container card">
            <textarea
              v-model="inputQuery"
              class="copilot-textarea"
              placeholder="向 AI 智囊咨询面试技巧、岗位痛点或话术... (Enter 发送)"
              rows="2"
              @keydown.enter.exact.prevent="handleSend"
            ></textarea>
            <button
              class="send-btn"
              :disabled="!inputQuery.trim() || isLoading"
              @click="handleSend"
            >
              <ArrowUpIcon class="icon-xs" />
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import { callLLMStream } from '@/lib/llmStream'
import { useAIConfigStore } from '@/stores/aiConfig'
import { useJobStore } from '@/stores/jobs'
import { useToast } from '@/composables/useToast'
import {
  Sparkles as SparklesIcon,
  Settings as SettingsIcon,
  Trash2 as Trash2Icon,
  Minimize2 as Minimize2Icon,
  Compass as CompassIcon,
  ChevronRight as ChevronRightIcon,
  Copy as CopyIcon,
  ArrowUp as ArrowUpIcon,
} from 'lucide-vue-next'

const route = useRoute()
const aiConfig = useAIConfigStore()
const jobStore = useJobStore()
const toast = useToast()

const isOpen = ref(false)
const inputQuery = ref('')
const isLoading = ref(false)
const msgContainer = ref<HTMLDivElement>()

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([])

// 页面上下文
const currentContextLabel = computed(() => {
  const path = route.path
  if (path.startsWith('/jobs/') && jobStore.currentJob) {
    return `职位详情 · ${jobStore.currentJob.title}`
  }
  if (path === '/jobs') return '职位探索列表'
  if (path.startsWith('/resume')) return '个人简历与诊断中心'
  if (path.startsWith('/interview')) return 'AI 模拟面试考场'
  if (path.startsWith('/recruiter/candidates')) return '牛人搜索智库'
  if (path.startsWith('/recruiter/jobs')) return '企业职位招聘管理'
  return 'KirinGo 智能招聘主站'
})

// 针对当前页面上下文动态推荐 Prompt
const contextualPrompts = computed(() => {
  const path = route.path
  if (path.startsWith('/jobs/') && jobStore.currentJob) {
    const title = jobStore.currentJob.title
    return [
      `分析「${title}」的核心考核要点与面试重点`,
      `帮我撰写一段针对「${title}」的求职打招呼高情商话术`,
      `如果面试「${title}」，HR 最关心的 3 个行为问题是什么？`,
    ]
  }
  if (path.startsWith('/resume')) {
    return [
      '如何用 STAR 原则量化改写我的项目经历？',
      '帮我提炼一段有感染力的技术求职自我评价',
      '简历中专业技能如何分类排版最显专业度？',
    ]
  }
  if (path.startsWith('/interview')) {
    return [
      '模拟技术面试时遇到答不上来的问题如何得体应对？',
      '如何向面试官反问高质量问题展现专业度？',
      '总结 5 个高频的前端/后端系统设计面试套路',
    ]
  }
  if (path.startsWith('/recruiter')) {
    return [
      '如何快速识别候选人简历中的真实贡献度？',
      '帮我起草一份具有吸引力的资深岗位招聘 JD',
      '初面快速考察候选人综合能力的 3 个通用问题',
    ]
  }
  return [
    '2026 年技术求职市场最关键的竞争力是什么？',
    '如何高效进行多轮面试准备与复盘？',
    '薪资谈判时如何争取合理的涨幅？',
  ]
})

function openCopilot() {
  isOpen.value = true
  scrollToBottom()
}

function clearMessages() {
  messages.value = []
  toast.info('对话已清空')
}

function renderMessage(content: string) {
  try {
    return marked.parse(content)
  } catch (_e) {
    return content
  }
}

async function copyText(text: string) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      toast.success('已复制到剪贴板')
    }
  } catch (_e) {
    toast.info('复制失败')
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight
    }
  })
}

function sendPrompt(prompt: string) {
  inputQuery.value = prompt
  handleSend()
}

async function handleSend() {
  const q = inputQuery.value.trim()
  if (!q || isLoading.value) return

  inputQuery.value = ''
  messages.value.push({ role: 'user', content: q })
  scrollToBottom()

  isLoading.value = true

  const assistantMsg: Message = { role: 'assistant', content: '' }
  messages.value.push(assistantMsg)

  const systemPrompt = `你是一位顶级职业规划顾问、猎头专家兼技术面试导师，内置于 KirinGo (麒麟智聘) 智能招聘平台。
当前用户所处页面上下文：${currentContextLabel.value}。
请结合上下文，以极其专业、敏锐、具实操性且富有启发性的语言回答用户的职业与求职问题。格式清晰，适度使用 Markdown。`

  const userPrompt = messages.value
    .slice(0, -1)
    .map((m) => `${m.role === 'user' ? '用户问题' : 'AI回答'}: ${m.content}`)
    .join('\n\n')

  try {
    await callLLMStream(
      systemPrompt,
      userPrompt,
      false,
      (fullText: string) => {
        assistantMsg.content = fullText
        scrollToBottom()
      }
    )
  } catch (err: any) {
    assistantMsg.content = `调用 AI 服务出错：${err?.message || '网络异常，请在右上角设置中检查 API Key'}。`
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.kirin-copilot-root {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9990;
}

/* 悬浮唤起胶囊 */
.copilot-floating-pill {
  position: relative;
  border: 1px solid var(--color-border-medium);
  background-color: var(--color-bg-surface-100);
  border-radius: var(--radius-full);
  padding: 10px 18px;
  cursor: pointer;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.copilot-floating-pill:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 16px 48px rgba(245, 78, 0, 0.25);
  border-color: var(--color-primary);
}

.pill-glow-ring {
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-full);
  background: radial-gradient(circle at center, rgba(245, 78, 0, 0.3), transparent 70%);
  opacity: 0.5;
  pointer-events: none;
}

.pill-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.copilot-sparkle-icon {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
  animation: pulse 2s infinite ease-in-out;
}

.pill-text {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--color-text-primary);
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-success);
  box-shadow: 0 0 6px var(--color-success);
}

/* 抽屉面板 */
.copilot-drawer-panel {
  width: 380px;
  height: 580px;
  max-height: calc(100vh - 48px);
  background-color: var(--color-bg-surface-100);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-xl);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-surface-200);
}

.drawer-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-avatar-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  background-color: rgba(245, 78, 0, 0.15);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.copilot-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.copilot-status {
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--color-primary);
}

.header-actions {
  display: flex;
  gap: 6px;
}

.action-icon-btn {
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all 0.15s;
}

.action-icon-btn:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-surface-300);
}

.context-banner {
  margin-top: 10px;
  padding: 4px 10px;
  background-color: var(--color-bg-surface-300);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.copilot-messages {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.welcome-card {
  padding: 16px;
  border-radius: var(--radius-md);
  background-color: var(--color-bg-surface-200);
  border: 1px solid var(--color-border);
}

.welcome-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.preset-prompts-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prompt-pill-btn {
  display: flex;
  align-items: center;
  text-align: left;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background-color: var(--color-bg-surface-100);
  border: 1px solid var(--color-border);
  font-size: 12px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.15s;
}

.prompt-pill-btn:hover {
  border-color: var(--color-primary);
  background-color: var(--color-bg-surface-300);
  transform: translateX(2px);
}

.copilot-msg-bubble {
  padding: 12px 14px;
  border-radius: var(--radius-md);
  max-width: 92%;
  font-size: 13px;
  line-height: 1.6;
}

.copilot-msg-bubble.user {
  align-self: flex-end;
  background-color: var(--color-primary);
  color: #ffffff;
  border-bottom-right-radius: 2px;
}

.copilot-msg-bubble.assistant {
  align-self: flex-start;
  background-color: var(--color-bg-surface-200);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  border-bottom-left-radius: 2px;
}

.msg-header {
  opacity: 0.6;
  margin-bottom: 4px;
  font-size: 9px;
  letter-spacing: 0.1em;
}

.msg-actions {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid var(--color-border);
}

.copy-btn {
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.copy-btn:hover {
  color: var(--color-primary);
}

.quick-chips-row {
  display: flex;
  gap: 6px;
  padding: 6px 16px;
  overflow-x: auto;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-surface-100);
}

.chip-tag {
  white-space: nowrap;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 99px;
  background-color: var(--color-bg-surface-300);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  cursor: pointer;
}

.chip-tag:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.drawer-footer {
  padding: 12px 16px 16px;
  background-color: var(--color-bg-surface-200);
  border-top: 1px solid var(--color-border);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--color-bg-surface-100);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
}

.copilot-textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-size: 12px;
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  line-height: 1.5;
}

.send-btn {
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-full);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.typing-dots {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-text-tertiary);
  animation: typingBounce 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

.icon-xxs {
  width: 12px;
  height: 12px;
}

@media (max-width: 480px) {
  .copilot-drawer-panel {
    width: calc(100vw - 32px);
    right: 16px;
    bottom: 16px;
  }
}
</style>
