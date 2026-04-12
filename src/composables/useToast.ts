// ============================================
// Toast 通知 composable
// ============================================
import { ref } from 'vue'
import type { ToastItem } from '@/types'

const toasts = ref<ToastItem[]>([])
let toastId = 0

export function useToast() {
  function showToast(message: string, type: ToastItem['type'] = 'info', duration = 3000) {
    const id = ++toastId
    toasts.value.push({ id, type, message })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function success(message: string) {
    showToast(message, 'success')
  }

  function error(message: string) {
    showToast(message, 'error')
  }

  function warning(message: string) {
    showToast(message, 'warning')
  }

  function info(message: string) {
    showToast(message, 'info')
  }

  return { toasts, showToast, success, error, warning, info }
}
