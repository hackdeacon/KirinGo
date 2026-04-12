// ============================================
// 共享 CORS 头
// ============================================
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/**
 * 调用 OpenAI Chat API
 */
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; json?: boolean } = {}
): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY') || ''
  const model = Deno.env.get('LLM_MODEL') || 'gpt-4o-mini'
  const baseUrl = Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com/v1'

  const isGemini = baseUrl.includes('generativelanguage.googleapis.com')

  if (isGemini) {
    // 处理 Gemini API 格式
    const url = `${baseUrl.replace(/\/$/, '')}/models/${model}:generateContent`
    const body: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
      }
    }

    if (options.json) {
      body.generationConfig.responseMimeType = 'application/json'
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(`Gemini API Error: ${data.error.message}`)
    }
    return data.candidates[0].content.parts[0].text
  } else {
    // 处理 OpenAI 兼容格式
    const body: any = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.7,
    }

    if (options.json) {
      body.response_format = { type: 'json_object' }
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`)
    }
    return data.choices[0].message.content
  }
}

/**
 * 调用 Embedding API (目前仅支持 OpenAI 格式)
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = Deno.env.get('OPENAI_API_KEY') || ''
  const baseUrl = Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com/v1'

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/embeddings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  const data = await response.json()
  return data.data[0].embedding
}
