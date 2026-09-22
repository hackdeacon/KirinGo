/**
 * Shared interview LLM configuration
 * Supports multiple fallback sources + User Custom Local Storage Key:
 * 0. User Custom Key (localStorage - Highest priority)
 * 1. VITE_INTERVIEW_* (primary env configuration)
 * 2. VITE_CHATANYWHERE_API_KEY (fallback)
 * 3. VITE_DEEPSEEK_API_KEY (fallback)
 * 4. VITE_LLM_API_KEY (generic fallback)
 */

function getCustom(key: string): string {
  try {
    return (localStorage.getItem(key) || '').trim()
  } catch (_e) {
    return ''
  }
}

export function getEffectiveInterviewConfig() {
  const customKey = getCustom('kiringo_custom_api_key')
  const customBaseUrl = getCustom('kiringo_custom_base_url')
  const customModel = getCustom('kiringo_custom_model')

  return {
    apiKey:
      customKey ||
      import.meta.env.VITE_INTERVIEW_API_KEY ||
      import.meta.env.VITE_CHATANYWHERE_API_KEY ||
      import.meta.env.VITE_DEEPSEEK_API_KEY ||
      import.meta.env.VITE_LLM_API_KEY ||
      '',
    baseUrl: (
      customBaseUrl ||
      import.meta.env.VITE_INTERVIEW_API_BASE_URL ||
      import.meta.env.VITE_CHATANYWHERE_BASE_URL ||
      import.meta.env.VITE_DEEPSEEK_BASE_URL ||
      import.meta.env.VITE_LLM_BASE_URL ||
      'https://api.chatanywhere.tech/v1'
    ).replace(/\/$/, ''),
    model:
      customModel ||
      import.meta.env.VITE_INTERVIEW_MODEL ||
      import.meta.env.VITE_CHATANYWHERE_MODEL ||
      import.meta.env.VITE_DEEPSEEK_MODEL ||
      import.meta.env.VITE_LLM_MODEL ||
      'gpt-4o-mini',
  }
}

export const INTERVIEW_API_KEY =
  getCustom('kiringo_custom_api_key') ||
  import.meta.env.VITE_INTERVIEW_API_KEY ||
  import.meta.env.VITE_CHATANYWHERE_API_KEY ||
  import.meta.env.VITE_DEEPSEEK_API_KEY ||
  import.meta.env.VITE_LLM_API_KEY ||
  ''

export const INTERVIEW_API_BASE_URL =
  getCustom('kiringo_custom_base_url') ||
  import.meta.env.VITE_INTERVIEW_API_BASE_URL ||
  import.meta.env.VITE_DEEPSEEK_BASE_URL ||
  import.meta.env.VITE_CHATANYWHERE_BASE_URL ||
  import.meta.env.VITE_LLM_BASE_URL ||
  'https://api.chatanywhere.tech/v1'

export const INTERVIEW_MODEL =
  getCustom('kiringo_custom_model') ||
  import.meta.env.VITE_INTERVIEW_MODEL ||
  import.meta.env.VITE_DEEPSEEK_MODEL ||
  import.meta.env.VITE_CHATANYWHERE_MODEL ||
  import.meta.env.VITE_LLM_MODEL ||
  'gpt-4o-mini'
