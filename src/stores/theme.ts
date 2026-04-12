// ============================================
// 主题状态管理 - 深色模式/浅色模式/自动切换
// ============================================
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'kirin-go-theme-mode'

export const useThemeStore = defineStore('theme', () => {
  // 从 localStorage 读取，默认 auto
  const storedMode = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  const mode = ref<ThemeMode>(storedMode || 'auto')

  // 跟踪系统偏好
  const systemPrefersDark = ref(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  // 计算实际生效的主题
  const effectiveMode = computed<'light' | 'dark'>(() => {
    if (mode.value === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return mode.value
  })

  // 设置主题模式
  function setMode(newMode: ThemeMode) {
    mode.value = newMode
  }

  // 监听系统偏好变化
  function setupSystemListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      systemPrefersDark.value = e.matches
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }

  // 持久化到 localStorage
  watch(mode, (newMode) => {
    localStorage.setItem(STORAGE_KEY, newMode)
  })

  // 初始化监听器
  const cleanup = setupSystemListener()

  return {
    mode,
    effectiveMode,
    setMode,
    cleanup
  }
})
