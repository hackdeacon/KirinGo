<template>
  <div class="chat-sidebar">
    <!-- Header with Search -->
    <div class="sidebar-header">
      <div class="search-container animate-fade-in">
        <SearchIcon class="search-icon icon-xs" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="SEARCH CONVERSATIONS..."
          class="search-input text-mono"
        />
      </div>

      <!-- Quick Filters -->
      <div class="filters-row text-mono animate-fade-in" style="animation-delay: 0.1s">
        <button
          class="filter-pill"
          :class="{ active: filter === 'all' }"
          @click="filter = 'all'"
        >
          ALL
        </button>
        <button
          class="filter-pill"
          :class="{ active: filter === 'unread' }"
          @click="filter = 'unread'"
        >
          UNREAD
        </button>
      </div>
    </div>

    <!-- Conversation List -->
    <div class="sidebar-scroll-area">
      <div v-if="filteredConversations.length" class="conversations-stack">
        <router-link
          v-for="(conv, i) in filteredConversations"
          :key="conv.id"
          :to="`/chat/${conv.id}`"
          class="conv-item animate-fade-in-up"
          :class="{ 'is-active': activeId === conv.id }"
          :style="{ animationDelay: `${i * 0.05}s` }"
        >
          <div class="avatar-box">
            <AppAvatar :src="getOtherAvatar(conv)" :alt="getOtherName(conv)" size="sm" />
            <div class="status-dot" v-if="isOnline(conv)"></div>
          </div>

          <div class="item-content">
            <div class="item-top">
              <span class="name-text">{{ getOtherName(conv) }}</span>
              <span class="time-text text-mono">{{ formatTime(conv.last_message_at) }}</span>
            </div>
            <div class="item-meta" v-if="conv.job">
              <span class="job-tag text-mono">{{ conv.job.title }}</span>
            </div>
            <div class="item-preview text-serif">
              {{ conv.last_message || '暂无消息' }}
            </div>
          </div>

          <div class="item-indicators">
            <div class="unread-dot" v-if="getUnread(conv) > 0"></div>
          </div>
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-else class="sidebar-empty text-mono animate-fade-in">
        {{ searchQuery ? 'NO RESULTS FOUND' : 'NO CONVERSATIONS' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import type { Conversation } from '@/types'
import AppAvatar from '@/components/AppAvatar.vue'
import { Search as SearchIcon } from 'lucide-vue-next'

const chatStore = useChatStore()
const authStore = useAuthStore()
const route = useRoute()

const searchQuery = ref('')
const filter = ref<'all' | 'unread'>('all')

const activeId = computed(() => route.params.id as string)

const filteredConversations = computed(() => {
  let list = chatStore.conversations

  // Apply Filter
  if (filter.value === 'unread') {
    list = list.filter(c => getUnread(c) > 0)
  }

  // Apply Search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => {
      const name = getOtherName(c).toLowerCase()
      const job = c.job?.title.toLowerCase() || ''
      return name.includes(q) || job.includes(q)
    })
  }

  return list
})

function getOtherName(conv: Conversation): string {
  if (authStore.user?.role === 'recruiter') {
    return conv.jobseeker?.full_name || '求职者'
  }
  return conv.recruiter?.full_name || '招聘者'
}

function getUnread(conv: Conversation): number {
  if (authStore.user?.role === 'recruiter') {
    return conv.recruiter_unread
  }
  return conv.jobseeker_unread
}

function getOtherAvatar(conv: Conversation): string {
  if (authStore.user?.role === 'recruiter') {
    return conv.jobseeker?.avatar_url || ''
  }
  return conv.recruiter?.avatar_url || ''
}

function isOnline(_conv: Conversation): boolean {
  // Mock online status logic
  return true
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'NOW'
  if (minutes < 60) return `${minutes}M`
  if (hours < 24) return `${hours}H`
  if (days < 7) return `${days}D`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }).toUpperCase()
}

onMounted(() => {
  chatStore.fetchConversations()
})
</script>

<style scoped>
.chat-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-bg-canvas);
  border-right: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.05);
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 6px 12px 6px 32px;
  background-color: var(--color-bg-surface-100);
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-radius: 6px;
  font-size: 11px;
  color: var(--color-text-primary);
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  background-color: var(--color-bg-canvas);
  border-color: oklab(0.263084 -0.00230259 0.0124794 / 0.2);
  box-shadow: var(--shadow-sm);
}

.filters-row {
  display: flex;
  gap: 8px;
}

.filter-pill {
  padding: 2px 8px;
  font-size: 9px;
  color: var(--color-text-tertiary);
  background: transparent;
  border: none;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.05em;
}

.filter-pill:hover {
  color: var(--color-error);
}

.filter-pill.active {
  color: var(--color-text-primary);
  background-color: var(--color-bg-surface-300);
}

/* Scroll Area */
.sidebar-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
  scrollbar-gutter: stable;
}

.conversations-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.conv-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  border-radius: var(--radius-md);
  margin: 0 8px;
}

.conv-item:hover {
  background-color: var(--color-bg-surface-100);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.conv-item.is-active {
  background-color: var(--color-bg-surface-200);
}

.conv-item.is-active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 15%;
  height: 70%;
  width: 3px;
  background-color: var(--color-primary);
  border-radius: 0 4px 4px 0;
}

.avatar-box {
  position: relative;
  flex-shrink: 0;
}

.status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: var(--color-success);
  border: 2px solid var(--color-bg-canvas);
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.05);
}

.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name-text {
  font-family: var(--font-display);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time-text {
  font-size: 10px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  letter-spacing: 0.05em;
}

.item-meta {
  margin-bottom: 2px;
}

.job-tag {
  font-size: 10px;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-surface-300);
  padding: 1px 8px;
  border-radius: var(--radius-pill);
  display: inline-block;
}

.item-preview {
  font-size: 12.5px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.conv-item.is-active .name-text {
  color: var(--color-text-primary);
}

.item-indicators {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.unread-dot {
  width: 7px;
  height: 7px;
  background-color: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--color-bg-canvas);
}

.sidebar-empty {
  padding: 48px 24px;
  text-align: center;
  font-size: 11px;
  color: var(--color-text-tertiary);
  letter-spacing: 0.12em;
}

/* Scrollbar */
.sidebar-scroll-area::-webkit-scrollbar {
  width: 4px;
}
.sidebar-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(38, 37, 30, 0.08);
  border-radius: 4px;
}
.sidebar-scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(38, 37, 30, 0.15);
}
</style>