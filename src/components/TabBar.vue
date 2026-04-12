<template>
  <nav class="tab-bar">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="tab-item"
      :class="{ active: isActive(tab.path) }"
    >
      <component :is="tab.icon" class="tab-icon" />
      <span class="tab-label">{{ tab.label }}</span>
      <span v-if="(tab as any).badge" class="tab-badge">{{ (tab as any).badge }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Home as HomeIcon,
  Briefcase as BriefcaseIcon,
  MessageSquare as MessageSquareIcon,
  User as UserIcon,
  LogIn as LogInIcon
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()

const tabs = computed(() => {
  const baseTabs = [
    { path: '/', icon: HomeIcon, label: '首页' },
    { path: '/jobs', icon: BriefcaseIcon, label: '职位' },
  ]

  if (authStore.isAuthenticated) {
    baseTabs.push(
      { path: '/chat', icon: MessageSquareIcon, label: '消息', badge: 1 } as any,
      { path: '/profile', icon: UserIcon, label: '我的' },
    )
  } else {
    baseTabs.push(
      { path: '/auth/login', icon: LogInIcon, label: '登录' },
    )
  }

  return baseTabs
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(242, 241, 237, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  padding-bottom: env(safe-area-inset-bottom, 0);
  z-index: 100;
}

.tab-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  text-decoration: none;
  color: var(--color-text-tertiary);
  transition: all 0.2s ease;
}

.tab-item.active {
  color: var(--color-text-primary);
}

.tab-icon {
  width: 20px;
  height: 20px;
}

.tab-label {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 400;
}

.tab-badge {
  position: absolute;
  top: 4px;
  right: 12px;
  min-width: 14px;
  height: 14px;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 600;
  color: white;
  background: var(--color-error);
  border-radius: var(--radius-pill);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
