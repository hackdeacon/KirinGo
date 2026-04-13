/**
 * Shared interview LLM configuration
 * Supports multiple fallback sources:
 * 1. VITE_INTERVIEW_* (primary configuration)
 * 2. VITE_CHATANYWHERE_API_KEY (fallback)
 * 3. VITE_DEEPSEEK_API_KEY (fallback)
 */

export const INTERVIEW_API_KEY =
  import.meta.env.VITE_INTERVIEW_API_KEY ||
  import.meta.env.VITE_CHATANYWHERE_API_KEY ||
  import.meta.env.VITE_DEEPSEEK_API_KEY ||
  ''

export const INTERVIEW_API_BASE_URL =
  import.meta.env.VITE_INTERVIEW_API_BASE_URL ||
  import.meta.env.VITE_DEEPSEEK_BASE_URL ||
  'https://api.chatanywhere.tech/v1'

export const INTERVIEW_MODEL =
  import.meta.env.VITE_INTERVIEW_MODEL ||
  import.meta.env.VITE_DEEPSEEK_MODEL ||
  'gpt-4o-mini'
