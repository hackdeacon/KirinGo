<template>
  <div class="chat-room-page">
    <div class="chat-desktop-layout" v-if="chatStore.conversations.length > 0">
      <!-- 左侧: 列表边栏 (1/3) -->
      <aside class="desktop-sidebar">
        <ChatSidebar />
      </aside>

      <!-- 中间: 聊天主窗口 (1/3) -->
      <main class="chat-main-content" v-if="conversation">
        <!-- 顶部导航栏 -->
        <header class="chat-header animate-fade-in">
          <div class="header-inner">
            <button class="back-link-mobile" @click="$router.push('/chat')">
              <ChevronLeftIcon class="icon-sm" />
            </button>
            <div class="chat-header-info">
              <div class="avatar-pulse-wrapper">
                <AppAvatar :src="otherAvatar" :alt="otherName" size="sm" />
                <div class="online-status-pulse"></div>
              </div>
              <div class="header-text">
                <h1 class="header-name text-display" :style="{ letterSpacing: 'var(--tracking-title-sm)' }">{{ otherName }}</h1>
                <p class="header-status text-mono">ONLINE</p>
              </div>
            </div>
            <div class="header-actions">
              <div class="status-badge text-mono">CONNECTED</div>
            </div>
          </div>
        </header>

        <!-- 消息列表 -->
        <div class="messages-area" ref="messagesArea">
          <!-- 切换加载状态 -->
          <div v-if="loadingMessages" class="loading-messages-overlay">
            <div class="loader-v2"></div>
          </div>

          <div class="messages-container" v-else>
            <div class="time-divider animate-fade-in">
              <span class="text-mono">TODAY</span>
            </div>

            <div
              v-for="(msg, i) in messages"
              :key="msg.id"
              class="message-item animate-fade-in-up"
              :class="{ 'is-mine': msg.sender_id === authStore.user?.id }"
              :style="{ animationDelay: `${(i % 20) * 0.05}s` }"
            >
              <div class="msg-avatar" v-if="msg.sender_id !== authStore.user?.id">
                <AppAvatar :src="otherAvatar" :alt="otherName" size="xs" />
              </div>
              <div class="msg-body">
                <div class="msg-bubble text-serif">
                  {{ msg.content }}
                </div>
                <div class="msg-time text-mono">{{ formatMsgTime(msg.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <footer class="input-section animate-fade-in-up">
          <div class="quick-replies-v2">
            <button v-for="reply in quickReplies" :key="reply" class="quick-reply-pill" @click="handleQuickReply(reply)">
              {{ reply }}
            </button>
          </div>

          <div class="input-bar-v2 card">
            <input
              v-model="inputText"
              type="text"
              class="msg-input-v2"
              placeholder="输入消息，开启对话..."
              @keyup.enter="handleSend"
            />
            <button class="send-btn-v2" @click="handleSend" :disabled="!inputText.trim()">
              <SendIcon class="icon-sm" />
            </button>
          </div>
        </footer>
      </main>

      <!-- 中间: 未选择状态 -->
      <main class="chat-main-content empty-selection" v-else>
        <div class="empty-content animate-fade-in">
          <MessageSquareIcon class="icon-xl opacity-20 mb-6" />
          <h2 class="text-display text-2xl mb-2">选择一个会话</h2>
          <p class="text-body-serif text-tertiary">在左侧列表中点击联系人，开始对话。</p>
        </div>
      </main>

      <!-- 右侧: 职位/个人详情 (1/3) -->
      <aside class="job-info-sidebar" v-if="conversation?.job">
        <div class="sidebar-inner">
          <div class="sidebar-content">
            <div class="job-info-section">
              <div class="section-label text-mono">JOB DETAILS</div>
              <h2 class="job-title text-display mt-2">{{ conversation.job.title }}</h2>
              <div class="job-meta-row mt-4">
                <span class="job-salary text-mono">{{ conversation.job.salary_min }}-{{ conversation.job.salary_max }}K</span>
                <span class="job-company text-serif">{{ conversation.job.company?.name }}</span>
              </div>
              <div class="job-badges mt-6">
                <span class="job-badge text-mono">{{ conversation.job.city }}</span>
                <span class="job-badge text-mono">{{ conversation.job.experience }}</span>
                <span class="job-badge text-mono">{{ conversation.job.education }}</span>
              </div>
            </div>

            <div class="job-info-section" v-if="conversation.job.company">
              <div class="section-label text-mono">COMPANY</div>
              <div class="company-card mt-4">
                <div class="company-logo">{{ conversation.job.company.name.charAt(0) }}</div>
                <div class="company-info">
                  <div class="company-name text-display">{{ conversation.job.company.name }}</div>
                  <div class="company-meta text-mono">{{ conversation.job.company.industry }} · {{ conversation.job.company.scale }}</div>
                </div>
              </div>
              <p class="company-desc text-serif mt-4" v-if="conversation.job.company.description">
                {{ conversation.job.company.description }}
              </p>
            </div>
          </div>

          <div class="sidebar-actions">
            <router-link :to="`/jobs/${conversation.job.id}`" class="btn-primary-v2 w-full text-center py-3">
              查看完整职位
            </router-link>
          </div>
        </div>
      </aside>

      <!-- 右侧: 无职位信息状态 -->
      <aside class="job-info-sidebar empty-sidebar" v-else-if="conversation">
        <div class="empty-content text-center px-6">
          <div class="section-label text-mono mb-8">NO JOB INFO</div>
          <p class="text-body-serif text-tertiary">此会话未关联特定职位。</p>
        </div>
      </aside>
    </div>

    <!-- 全局空状态 -->
    <div class="chat-empty-global" v-else>
      <div class="empty-content animate-fade-in">
        <div class="icon-box-v2 mb-8">
          <MessageSquareIcon class="icon-xl" />
        </div>
        <h1 class="text-display text-4xl mb-4">暂无消息</h1>
        <p class="text-body-serif text-lg mb-8 max-w-md mx-auto">
          你还没有任何对话记录。去浏览一下职位，主动联系心仪的公司吧。
        </p>
        <router-link to="/jobs" class="btn-primary-v2 px-8 py-3">
          浏览职位
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import AppAvatar from '@/components/AppAvatar.vue'
import ChatSidebar from '@/components/chat/ChatSidebar.vue'
import {
  ChevronLeft as ChevronLeftIcon,
  Send as SendIcon,
  MessageSquare as MessageSquareIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()

const inputText = ref('')
const messagesArea = ref<HTMLElement>()
let unsubscribe: (() => void) | null = null

const conversationId = computed(() => route.params.id as string)
const conversation = computed(() =>
  chatStore.conversations.find(c => c.id === conversationId.value)
)
const messages = computed(() => chatStore.messages)
const loadingMessages = ref(false)
const otherName = computed(() => {
  if (!conversation.value) return '用户'
  if (authStore.user?.role === 'recruiter') {
    return conversation.value.jobseeker?.full_name || '求职者'
  }
  return conversation.value.recruiter?.full_name || '招聘者'
})
const otherAvatar = computed(() => {
  if (!conversation.value) return ''
  if (authStore.user?.role === 'recruiter') {
    return conversation.value.jobseeker?.avatar_url || ''
  }
  return conversation.value.recruiter?.avatar_url || ''
})

const quickReplies = [
  '你好，方便聊一下吗？',
  '请问还在招人吗？',
  '期望薪资是多少？',
  '什么时候方便面试？',
]

async function handleSend() {
  if (!inputText.value.trim() || !conversationId.value) return
  const text = inputText.value.trim()
  inputText.value = ''
  await chatStore.sendMessage(conversationId.value, text)
  scrollToBottom()
}

function handleQuickReply(reply: string) {
  inputText.value = reply
  handleSend()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight
    }
  })
}

function formatMsgTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  // 确保会话列表已加载
  if (chatStore.conversations.length === 0) {
    await chatStore.fetchConversations()
  }

  // 路由守卫已经处理了 /chat 到 /chat/:id 的重定向
  // 这里只需处理当前会话的消息加载
  if (conversationId.value) {
    if (messages.value.length === 0) {
      loadingMessages.value = true
    }
    await chatStore.fetchMessages(conversationId.value)
    loadingMessages.value = false
    scrollToBottom()
    unsubscribe = chatStore.subscribeToMessages(conversationId.value)
  }
})

// 监听路由变化，切换会话时刷新消息
watch(conversationId, async (newId) => {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
  if (newId) {
    // 只有在没有缓存时才显示加载状态
    if (messages.value.length === 0) {
      loadingMessages.value = true
    }
    
    await chatStore.fetchMessages(newId)
    loadingMessages.value = false
    scrollToBottom()
    unsubscribe = chatStore.subscribeToMessages(newId)
  }
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<style scoped>
.chat-room-page {
  /* 80px 是 AppHeader 的高度 */
  height: calc(100vh - 80px);
  background-color: var(--color-bg-canvas);
  overflow: hidden;
  padding: 12px 24px 24px; /* 减小顶部间距，增加底部间距 */
}

.chat-desktop-layout {
  display: flex;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--color-bg-canvas);
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

/* 三栏布局逻辑优化 */
.desktop-sidebar {
  width: 280px; /* 固宽，保证中间区域弹性 */
  flex-shrink: 0;
  height: 100%;
  border-right: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  background-color: var(--color-bg-canvas);
}

.chat-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-surface-100);
  min-width: 0;
  border-right: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
}

.job-info-sidebar {
  width: 320px; /* 固宽，适当加宽提升可读性 */
  flex-shrink: 0;
  background-color: var(--color-bg-canvas);
  border-left: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  overflow-y: auto;
}

/* 顶部导航栏 */
.chat-header {
  background-color: var(--color-bg-canvas);
  border-bottom: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  padding: 16px 24px;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-pulse-wrapper {
  position: relative;
}

.online-status-pulse {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: var(--color-success);
  border: 2px solid var(--color-bg-canvas);
  border-radius: 50%;
}

.header-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-status {
  font-size: 9px;
  color: var(--color-text-tertiary);
  letter-spacing: 0.1em;
}

.status-badge {
  font-size: 10px;
  padding: 4px 10px;
  background-color: var(--color-bg-surface-300);
  border-radius: var(--radius-pill);
  color: var(--color-text-tertiary);
}

/* 消息列表 */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
  position: relative;
}

/* 消息加载状态 */
.loading-messages-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-surface-100);
  z-index: 10;
}

.loader-v2 {
  width: 24px;
  height: 24px;
  border: 2px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-top-color: var(--color-text-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.messages-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.time-divider {
  text-align: center;
  margin: 16px 0;
  position: relative;
}

.time-divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background-color: oklab(0.263084 -0.00230259 0.0124794 / 0.05);
  z-index: 0;
}

.time-divider span {
  position: relative;
  background-color: var(--color-bg-surface-100);
  padding: 0 16px;
  font-size: 10px;
  color: var(--color-text-tertiary);
  letter-spacing: 0.1em;
}

.message-item {
  display: flex;
  gap: 12px;
  max-width: 85%;
}

.message-item.is-mine {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.is-mine .msg-body {
  align-items: flex-end;
}

.msg-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  background-color: var(--color-bg-canvas);
  color: var(--color-text-primary);
  font-size: 15px;
  line-height: 1.6;
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.05);
}

.is-mine .msg-bubble {
  background-color: var(--color-bg-surface-400);
  border: none;
}

.msg-time {
  font-size: 10px;
  color: var(--color-text-tertiary);
}

/* 输入区 */
.input-section {
  padding: 20px 24px;
  background-color: var(--color-bg-canvas);
  border-top: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
}

.quick-replies-v2 {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.quick-reply-pill {
  white-space: nowrap;
  padding: 6px 12px;
  font-size: 12px;
  background-color: var(--color-bg-surface-100);
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.05);
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.quick-reply-pill:hover {
  background-color: var(--color-bg-surface-200);
  border-color: oklab(0.263084 -0.00230259 0.0124794 / 0.1);
}

.input-bar-v2 {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 8px 8px 20px;
  background-color: var(--color-bg-surface-100);
  border-radius: var(--radius-pill);
}

.msg-input-v2 {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--color-text-primary);
}

.send-btn-v2 {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-text-primary);
  color: var(--color-bg-canvas);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.send-btn-v2:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.send-btn-v2:not(:disabled):hover {
  transform: scale(1.05);
}

/* 右侧边栏内容 */
.sidebar-inner {
  height: 100%;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
  overflow-y: auto;
  padding-right: 4px;
}

.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-radius: 2px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: oklab(0.263084 -0.00230259 0.0124794 / 0.2);
}

.section-label {
  font-size: 10px;
  color: var(--color-text-tertiary);
  letter-spacing: 0.15em;
}

.job-title {
  font-size: 24px;
  line-height: 1.2;
}

.job-meta-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.job-salary {
  font-size: 14px;
  color: var(--color-primary);
  font-weight: 600;
}

.job-company {
  font-size: 15px;
  color: var(--color-text-secondary);
}

.job-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.job-badge {
  padding: 4px 10px;
  background-color: var(--color-bg-surface-100);
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.05);
  border-radius: 9999px;
  font-size: 10px;
  color: var(--color-text-tertiary);
}

.company-card {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background-color: var(--color-bg-surface-100);
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.08);
  border-radius: 12px;
}

.company-logo {
  width: 48px;
  height: 48px;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  border-radius: 12px;
}

.company-name {
  font-size: 16px;
  font-weight: 600;
}

.company-meta {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.company-desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

/* 底部操作按钮 */
.sidebar-actions {
  padding-top: 24px;
  border-top: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.08);
}

.sidebar-actions .btn-primary-v2 {
  display: block;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.sidebar-actions .btn-primary-v2:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

/* 空状态 */
.empty-selection, .empty-sidebar, .chat-empty-global {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-content {
  max-width: 320px;
}

.chat-empty-global {
  height: 100%;
}

.icon-box-v2 {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-surface-100);
  border-radius: 24px;
  color: var(--color-text-tertiary);
}

.icon-xl {
  width: 48px;
  height: 48px;
}

.opacity-20 { opacity: 0.2; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.mb-8 { margin-bottom: 32px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }

@media (max-width: 1200px) {
  .job-info-sidebar {
    width: 280px;
  }
}

@media (max-width: 1024px) {
  .chat-room-page {
    padding: 0;
  }
  .chat-desktop-layout {
    border: none;
    border-radius: 0;
    box-shadow: none;
    max-width: 100%;
  }
  .desktop-sidebar {
    display: none;
  }
  .job-info-sidebar {
    display: none;
  }
  .back-link-mobile {
    display: flex;
  }
}
</style>

