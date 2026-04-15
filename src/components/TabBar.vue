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
  left: 50%;
  transform: translateX(-50%);
  width: min(calc(100% - 32px), 420px);
  height: 56px;
  margin-bottom: calc(12px + env(safe-area-inset-bottom, 0));
  background: color-mix(in oklab, var(--color-bg-surface-200) 70%, transparent);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid color-mix(in oklab, var(--color-border) 60%, transparent);
  border-radius: 9999px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  z-index: 100;
}

.tab-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 9999px;
  text-decoration: none;
  color: var(--color-text-tertiary);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-item.active {
  color: var(--color-text-primary);
  background: color-mix(in oklab, var(--color-text-primary) 12%, transparent);
  padding: 6px 32px;
  box-shadow: 0 2px 8px color-mix(in oklab, var(--color-text-primary) 8%, transparent);
}

.tab-icon {
  width: 20px;
  height: 20px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-item.active .tab-icon {
  transform: translateY(-1px);
  color: var(--color-text-primary);
}

.tab-label {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 500;
  opacity: 0.8;
  transition: all 0.25s ease;
}

.tab-item.active .tab-label {
  opacity: 1;
  font-weight: 600;
  color: var(--color-text-primary);
}

.tab-badge {
  position: absolute;
  top: 2px;
  right: 8px;
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

@media (max-width: 360px) {
  .tab-bar {
    width: calc(100% - 24px);
    height: 52px;
    margin-bottom: calc(8px + env(safe-area-inset-bottom, 0));
  }
  .tab-item {
    padding: 4px 8px;
  }
}
</style>
