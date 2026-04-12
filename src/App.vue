<template>
  <div id="kiringo-app">
    <!-- 全局加载屏 -->
    <div v-if="!authReady" class="app-loading-screen">
      <div class="app-loading-logo">K</div>
      <div class="app-loading-spinner"></div>
      <div class="app-loading-text">正在初始化...</div>
    </div>

    <template v-else>
      <!-- Toast 通知 -->
      <div class="toast-container" v-if="toasts.length">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
        >
          <div class="toast-content">
            <component :is="getToastIcon(toast.type)" class="toast-icon" />
            <span>{{ toast.message }}</span>
          </div>
        </div>
      </div>

      <AppHeader v-if="!isAuthPage" />
      <main :class="['main-content', { 'auth-main': isAuthPage }]">
        <router-view v-slot="{ Component, route: viewRoute }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="viewRoute.path" />
          </transition>
        </router-view>
      </main>
      <AppFooter v-if="showFooter" />
      <TabBar v-if="showTabBar" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import TabBar from '@/components/TabBar.vue'
import {
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Info as InfoIcon
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { toasts } = useToast()

// Auth 初始化完成后才显示 UI，杜绝闪烁
const authReady = computed(() => !authStore.loading)

const mobileQuery = window.matchMedia('(max-width: 767px)')

const isMobile = ref(mobileQuery.matches)

const isAuthPage = computed(() => {
  return route.path.startsWith('/auth')
})

const isFullHeightPage = computed(() => {
  return route.path.startsWith('/chat') || route.path.startsWith('/interview')
})

const showFooter = computed(() => !isAuthPage.value && !isFullHeightPage.value)

const showTabBar = computed(() => isMobile.value && !isAuthPage.value)

const handleMobileChange = (event: MediaQueryListEvent) => {
  isMobile.value = event.matches
}

const TOAST_ICONS = {
  success: CheckCircleIcon,
  error: AlertCircleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon
} as const

function getToastIcon(type: string) {
  return TOAST_ICONS[type as keyof typeof TOAST_ICONS] || TOAST_ICONS.info
}

function applyTheme(effectiveMode: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', effectiveMode === 'dark')
}

onMounted(() => {
  mobileQuery.addEventListener('change', handleMobileChange)
  applyTheme(themeStore.effectiveMode)
})

watch(() => themeStore.effectiveMode, applyTheme)

onBeforeUnmount(() => {
  mobileQuery.removeEventListener('change', handleMobileChange)
  themeStore.cleanup()
})
</script>

<style scoped>
/* 全局加载屏 - Cursor Warm Minimalist */
.app-loading-screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background-color: var(--color-bg-canvas);
  z-index: 9999;
}

.app-loading-logo {
  width: 64px;
  height: 64px;
  background: var(--color-bg-surface-400);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 28px;
  font-family: var(--font-display);
  line-height: 1;
}

.app-loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.app-loading-text {
  font-family: var(--font-display);
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* 页面过渡 - Cursor Subtle Slide */
.page-enter-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
}

.main-content {
  min-height: calc(100vh - 48px);
}

.auth-main {
  min-height: 100vh;
}

/* Toast Container - Warm Surface with depth */
.toast-container {
  position: fixed;
  top: 72px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  width: max-content;
}

.toast {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 400;
  background: var(--color-bg-surface-200);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-cursor-elevated);
  color: var(--color-text-primary);
  animation: toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  pointer-events: auto;
  white-space: nowrap;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-icon {
  width: 16px;
  height: 16px;
}

.toast-success {
  border-left: 4px solid var(--color-success);
}

.toast-success .toast-icon {
  color: var(--color-success);
}

.toast-error {
  border-left: 4px solid var(--color-error);
  color: var(--color-error);
}

.toast-warning {
  border-left: 4px solid #c08532;
}

.toast-warning .toast-icon {
  color: #c08532;
}

.toast-info {
  border-left: 4px solid var(--color-primary);
}

.toast-info .toast-icon {
  color: var(--color-primary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding-bottom: 64px;
  }

  .toast-container {
    top: auto;
    bottom: 80px;
    left: 16px;
    right: 16px;
    transform: none;
    width: auto;
  }

  .toast {
    white-space: normal;
    text-align: center;
  }

  .toast-content {
    justify-content: center;
  }
}
</style>
