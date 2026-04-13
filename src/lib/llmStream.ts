/**
 * Shared LLM streaming utility for OpenAI-compatible APIs
 * Automatic runtime fallback with priority:
 * 1. ChatAnywhere (same as AI mock interview) - FIRST priority
 * 2. DeepSeek - Second fallback
 * 3. OpenRouter - Last resort
 * Supports streaming SSE-style responses with incremental chunk callbacks
 */

interface LLMProviderConfig {
  apiKey: string
  baseUrl: string
  model: string
  name: string
}

// Get all configured providers in priority order
function getProviderChain(): LLMProviderConfig[] {
  const providers: LLMProviderConfig[] = []

  // 1. ChatAnywhere - highest priority
  if (import.meta.env.VITE_CHATANYWHERE_API_KEY) {
    providers.push({
      apiKey: import.meta.env.VITE_CHATANYWHERE_API_KEY,
      baseUrl: import.meta.env.VITE_CHATANYWHERE_BASE_URL || 'https://api.chatanywhere.tech/v1',
      model: import.meta.env.VITE_CHATANYWHERE_MODEL || 'gpt-4o-mini',
      name: 'ChatAnywhere',
    })
  }

  // 2. DeepSeek - second priority
  if (import.meta.env.VITE_DEEPSEEK_API_KEY) {
    providers.push({
      apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
      baseUrl: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
      model: import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat',
      name: 'DeepSeek',
    })
  }

  // 3. Generic LLM config
  if (import.meta.env.VITE_LLM_API_KEY && !providers.find(p => p.apiKey === import.meta.env.VITE_LLM_API_KEY)) {
    providers.push({
      apiKey: import.meta.env.VITE_LLM_API_KEY,
      baseUrl: import.meta.env.VITE_LLM_BASE_URL || 'https://api.chatanywhere.tech/v1',
      model: import.meta.env.VITE_LLM_MODEL || 'gpt-4o-mini',
      name: 'GenericLLM',
    })
  }

  // 4. OpenRouter - last resort only
  if (import.meta.env.VITE_OPENROUTER_API_KEY && !providers.find(p => p.apiKey === import.meta.env.VITE_OPENROUTER_API_KEY)) {
    providers.push({
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
      baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      model: import.meta.env.VITE_OPENROUTER_MODEL || 'gpt-4o-mini',
      name: 'OpenRouter',
    })
  }

  // If no providers configured from env, default to ChatAnywhere with whatever key we have
  if (providers.length === 0) {
    providers.push({
      apiKey: '',
      baseUrl: 'https://api.chatanywhere.tech/v1',
      model: 'gpt-4o-mini',
      name: 'ChatAnywhere',
    })
  }

  return providers
}

// Export top-priority provider config for compatibility with components that check LLM config
const topProviders = getProviderChain()
export const LLM_API_KEY = topProviders[0].apiKey
export const LLM_BASE_URL = topProviders[0].baseUrl
export const LLM_MODEL = topProviders[0].model

/**
 * Direct LLM streaming call compatible with OpenAI format
 * Automatically tries next provider on failure
 * @param systemPrompt - System instruction
 * @param userPrompt - User message
 * @param jsonOutput - Whether to request JSON output
 * @param onChunk - Callback for each incremental chunk (receives full text so far)
 * @returns Complete full text response
 */
export async function callLLMStream(
  systemPrompt: string,
  userPrompt: string,
  jsonOutput = false,
  onChunk?: (fullText: string) => void
): Promise<string> {
  const providers = getProviderChain()
  const errors: string[] = []

  // Try each provider in priority order
  for (const provider of providers) {
    try {
      const url = `${provider.baseUrl.replace(/\/$/, '')}/chat/completions`

      const body: any = {
        model: provider.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        stream: true,
      }

      // OpenRouter requires extra reasoning param
      if (provider.baseUrl.includes('openrouter.ai')) {
        body.reasoning = { enabled: true }
      }

      if (jsonOutput) {
        body.response_format = { type: 'json_object' }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'KirinGo',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        let errorMsg = `${provider.name} API Error: ${response.statusText} (${response.status})`
        try {
          const error = await response.json()
          errorMsg = `${provider.name} API Error: ${error.error?.message || response.statusText || response.status}`
        } catch (_jsonError) {
          // If response isn't JSON, don't fail — just use status text
        }
        errors.push(errorMsg)
        // Try next provider
        continue
      }

      if (!response.body) {
        errors.push(`${provider.name}: No response body received`)
        continue
      }

      // Success! Stream the response with proper buffering
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''
      let hasReceivedContent = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Append new chunk to buffer
        buffer += decoder.decode(value, { stream: true })

        // Process complete lines from buffer
        let newlineIndex: number
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newlineIndex).trim()
          buffer = buffer.slice(newlineIndex + 1)

          if (!line) continue

          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content
              if (content) {
                fullText += content
                hasReceivedContent = true
                if (onChunk) {
                  onChunk(fullText)
                }
              }
            } catch (e) {
              // Only warn if it's complete but invalid JSON, ignore incomplete chunks
              if (!data.includes('\\')) {
                console.warn('Failed to parse complete SSE chunk:', e)
              }
            }
          }
        }
      }

      // Flush any remaining content in buffer
      if (buffer.trim()) {
        const line = buffer.trim()
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content
              if (content) {
                fullText += content
                hasReceivedContent = true
                if (onChunk) {
                  onChunk(fullText)
                }
              }
            } catch (e) {
              // Ignore last incomplete chunk
            }
          }
        }
      }

      // If we got no content, consider this a failure and try next provider
      if (!hasReceivedContent && !fullText) {
        errors.push(`${provider.name}: No content received in stream`)
        continue
      }

      return fullText

    } catch (error) {
      errors.push(`${provider.name}: ${error instanceof Error ? error.message : String(error)}`)
      // Continue to next provider
    }
  }

  // All providers failed
  throw new Error(`All LLM providers failed: ${errors.join('; ')}`)
}
