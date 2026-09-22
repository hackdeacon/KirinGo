// ============================================
// AI 模型与引擎配置 Store
// 支持前台自定义 API Key，彻底解决环境失效与配额问题
// ============================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const KEY_STORAGE = 'kiringo_custom_api_key'
const BASE_URL_STORAGE = 'kiringo_custom_base_url'
const MODEL_STORAGE = 'kiringo_custom_model'
const PROVIDER_STORAGE = 'kiringo_custom_provider'

export type AIProvider = 'chatanywhere' | 'deepseek' | 'openai' | 'custom'

export const PROVIDER_PRESETS: Record<AIProvider, { name: string; baseUrl: string; defaultModel: string; hint: string }> = {
  chatanywhere: {
    name: 'ChatAnywhere (免费/开发者)',
    baseUrl: 'https://api.chatanywhere.tech/v1',
    defaultModel: 'gpt-4o-mini',
    hint: '前往 chatanywhere.tech 绑定 GitHub 即可免费获取新版配额',
  },
  deepseek: {
    name: 'DeepSeek (极速/高性价比)',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    hint: '前往 platform.deepseek.com 获取 API Key',
  },
  openai: {
    name: 'OpenAI 官方',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    hint: '需要海外网络与 OpenAI 开发者账号',
  },
  custom: {
    name: '自定义 OpenAI 兼容接口',
    baseUrl: '',
    defaultModel: 'gpt-4o-mini',
    hint: '兼容 OneAPI / NewAPI / FastGPT / Ollama 等',
  },
}

export const useAIConfigStore = defineStore('aiConfig', () => {
  const isSettingsOpen = ref(false)

  // 读取本地配置
  const customApiKey = ref(localStorage.getItem(KEY_STORAGE) || '')
  const customBaseUrl = ref(localStorage.getItem(BASE_URL_STORAGE) || '')
  const customModel = ref(localStorage.getItem(MODEL_STORAGE) || '')
  const activeProvider = ref<AIProvider>(
    (localStorage.getItem(PROVIDER_STORAGE) as AIProvider) || 'chatanywhere'
  )

  // 测试状态
  const isTesting = ref(false)
  const testResult = ref<{ ok: boolean; message: string; latency?: number } | null>(null)

  // 最终生效配置
  const effectiveApiKey = computed(() => {
    if (customApiKey.value.trim()) return customApiKey.value.trim()
    return (
      import.meta.env.VITE_INTERVIEW_API_KEY ||
      import.meta.env.VITE_CHATANYWHERE_API_KEY ||
      import.meta.env.VITE_DEEPSEEK_API_KEY ||
      import.meta.env.VITE_LLM_API_KEY ||
      ''
    )
  })

  const effectiveBaseUrl = computed(() => {
    if (customBaseUrl.value.trim()) return customBaseUrl.value.trim().replace(/\/$/, '')
    if (activeProvider.value && PROVIDER_PRESETS[activeProvider.value]?.baseUrl) {
      return PROVIDER_PRESETS[activeProvider.value].baseUrl
    }
    return (
      import.meta.env.VITE_INTERVIEW_API_BASE_URL ||
      import.meta.env.VITE_CHATANYWHERE_BASE_URL ||
      import.meta.env.VITE_DEEPSEEK_BASE_URL ||
      import.meta.env.VITE_LLM_BASE_URL ||
      'https://api.chatanywhere.tech/v1'
    ).replace(/\/$/, '')
  })

  const effectiveModel = computed(() => {
    if (customModel.value.trim()) return customModel.value.trim()
    if (activeProvider.value && PROVIDER_PRESETS[activeProvider.value]?.defaultModel) {
      return PROVIDER_PRESETS[activeProvider.value].defaultModel
    }
    return (
      import.meta.env.VITE_INTERVIEW_MODEL ||
      import.meta.env.VITE_CHATANYWHERE_MODEL ||
      import.meta.env.VITE_DEEPSEEK_MODEL ||
      import.meta.env.VITE_LLM_MODEL ||
      'gpt-4o-mini'
    )
  })

  const hasCustomKey = computed(() => Boolean(customApiKey.value.trim()))

  function openSettings() {
    isSettingsOpen.value = true
    testResult.value = null
  }

  function closeSettings() {
    isSettingsOpen.value = false
  }

  function saveConfig(params: {
    apiKey: string
    baseUrl: string
    model: string
    provider: AIProvider
  }) {
    customApiKey.value = params.apiKey.trim()
    customBaseUrl.value = params.baseUrl.trim()
    customModel.value = params.model.trim()
    activeProvider.value = params.provider

    if (customApiKey.value) {
      localStorage.setItem(KEY_STORAGE, customApiKey.value)
    } else {
      localStorage.removeItem(KEY_STORAGE)
    }

    if (customBaseUrl.value) {
      localStorage.setItem(BASE_URL_STORAGE, customBaseUrl.value)
    } else {
      localStorage.removeItem(BASE_URL_STORAGE)
    }

    if (customModel.value) {
      localStorage.setItem(MODEL_STORAGE, customModel.value)
    } else {
      localStorage.removeItem(MODEL_STORAGE)
    }

    localStorage.setItem(PROVIDER_STORAGE, activeProvider.value)
  }

  function resetToDefaults() {
    customApiKey.value = ''
    customBaseUrl.value = ''
    customModel.value = ''
    activeProvider.value = 'chatanywhere'
    localStorage.removeItem(KEY_STORAGE)
    localStorage.removeItem(BASE_URL_STORAGE)
    localStorage.removeItem(MODEL_STORAGE)
    localStorage.removeItem(PROVIDER_STORAGE)
    testResult.value = null
  }

  // 连通性测试
  async function testConnection(testParams?: { apiKey?: string; baseUrl?: string; model?: string }) {
    isTesting.value = true
    testResult.value = null

    const key = testParams?.apiKey ?? effectiveApiKey.value
    const baseUrl = (testParams?.baseUrl ?? effectiveBaseUrl.value).replace(/\/$/, '')
    const model = testParams?.model ?? effectiveModel.value

    if (!key) {
      isTesting.value = false
      testResult.value = { ok: false, message: '请先填写或配置有效的 API Key' }
      return testResult.value
    }

    const start = performance.now()
    try {
      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5,
        }),
      })

      const latency = Math.round(performance.now() - start)
      const data = await resp.json().catch(() => null)

      if (resp.ok) {
        testResult.value = {
          ok: true,
          message: `连接成功！响应正常，模型 [${model}] 可用`,
          latency,
        }
      } else {
        testResult.value = {
          ok: false,
          message: data?.error?.message || `API 请求错误 (${resp.status})`,
          latency,
        }
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - start)
      testResult.value = {
        ok: false,
        message: err?.message || '网络连接超时或跨域被阻止',
        latency,
      }
    } finally {
      isTesting.value = false
    }

    return testResult.value
  }

  return {
    isSettingsOpen,
    customApiKey,
    customBaseUrl,
    customModel,
    activeProvider,
    effectiveApiKey,
    effectiveBaseUrl,
    effectiveModel,
    hasCustomKey,
    isTesting,
    testResult,
    openSettings,
    closeSettings,
    saveConfig,
    resetToDefaults,
    testConnection,
  }
})
