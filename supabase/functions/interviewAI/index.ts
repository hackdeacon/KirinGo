// ============================================
// Edge Function: interviewAI
// AI 模拟面试 - 多轮对话
// ============================================
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders, callLLM } from '../_shared/cors.ts'

type InterviewRole = 'ai' | 'user'
type InterviewType = 'technical' | 'behavioral' | 'comprehensive'
type InterviewDifficulty = 'easy' | 'medium' | 'hard'

type InterviewMessage = {
  role: InterviewRole
  content: string
}

type ResumeLike = Record<string, unknown> | null

type InterviewFeedback = {
  score: number
  communication: number
  technical: number
  experience: number
  overall: string
  strengths: string[]
  improvements: string[]
}

const defaultFeedback: InterviewFeedback = {
  score: 0,
  communication: 0,
  technical: 0,
  experience: 0,
  overall: '本次面试数据不足，建议补充完整问答后再次评估。',
  strengths: [],
  improvements: [],
}

const interviewLLMConfig = {
  apiKey: Deno.env.get('DEEPSEEK_API_KEY') || Deno.env.get('OPENAI_API_KEY') || '',
  baseUrl: Deno.env.get('DEEPSEEK_BASE_URL') || 'https://api.deepseek.com/v1',
  model: Deno.env.get('DEEPSEEK_MODEL') || 'deepseek-chat',
}

function buildInterviewLLMOptions(options: { temperature?: number; json?: boolean } = {}) {
  return {
    ...options,
    apiKey: interviewLLMConfig.apiKey,
    baseUrl: interviewLLMConfig.baseUrl,
    model: interviewLLMConfig.model,
  }
}

function clampScore(value: unknown) {
  const score = Number(value)
  if (Number.isNaN(score)) return 0
  return Math.max(0, Math.min(100, Math.round(score)))
}

function toText(value: unknown) {
  if (typeof value === 'string') return value.trim()
  return ''
}

function normalizeMessages(input: unknown): InterviewMessage[] {
  if (!Array.isArray(input)) return []

  return input
    .map(item => {
      if (!item || typeof item !== 'object') return null
      const role = (item as { role?: unknown }).role
      const content = toText((item as { content?: unknown }).content)

      if ((role !== 'ai' && role !== 'user') || !content) return null
      return { role, content } as InterviewMessage
    })
    .filter(Boolean) as InterviewMessage[]
}

function summarizeResume(resume: ResumeLike) {
  if (!resume || typeof resume !== 'object') return '未提供'

  try {
    const basicInfo = (resume as { basic_info?: Record<string, unknown> }).basic_info || {}
    const summary = {
      name: toText(basicInfo.name) || '未填写',
      selfEvaluation: toText((resume as { self_evaluation?: unknown }).self_evaluation) || '未填写',
      skills: Array.isArray((resume as { skills?: unknown[] }).skills)
        ? (resume as { skills?: unknown[] }).skills!.slice(0, 12)
        : [],
      experienceCount: Array.isArray((resume as { experience?: unknown[] }).experience)
        ? (resume as { experience?: unknown[] }).experience!.length
        : 0,
      projectCount: Array.isArray((resume as { projects?: unknown[] }).projects)
        ? (resume as { projects?: unknown[] }).projects!.length
        : 0,
      educationCount: Array.isArray((resume as { education?: unknown[] }).education)
        ? (resume as { education?: unknown[] }).education!.length
        : 0,
    }
    return JSON.stringify(summary, null, 2)
  } catch (_error) {
    return '简历解析失败'
  }
}

function getDifficultyLabel(difficulty: InterviewDifficulty) {
  if (difficulty === 'easy') return '初级'
  if (difficulty === 'hard') return '高级'
  return '中级'
}

function getTypeLabel(type: InterviewType) {
  if (type === 'behavioral') return '行为面试'
  if (type === 'comprehensive') return '综合面试'
  return '技术面试'
}

function getTurnStats(messages: InterviewMessage[]) {
  const userTurns = messages.filter(message => message.role === 'user').length
  const aiTurns = messages.filter(message => message.role === 'ai').length
  return { userTurns, aiTurns, totalTurns: Math.max(userTurns, aiTurns) }
}

function buildTranscript(messages: InterviewMessage[]) {
  if (!messages.length) return '暂无历史对话'
  return messages
    .map(message => `${message.role === 'ai' ? '面试官' : '候选人'}: ${message.content}`)
    .join('\n')
}

function normalizeFeedback(input: unknown): InterviewFeedback {
  if (!input || typeof input !== 'object') return { ...defaultFeedback }

  const payload = input as Record<string, unknown>
  const strengthsRaw = Array.isArray(payload.strengths) ? payload.strengths : []
  const improvementsRaw = Array.isArray(payload.improvements) ? payload.improvements : []

  return {
    score: clampScore(payload.score),
    communication: clampScore(payload.communication),
    technical: clampScore(payload.technical),
    experience: clampScore(payload.experience),
    overall: toText(payload.overall) || defaultFeedback.overall,
    strengths: strengthsRaw.map(toText).filter(Boolean).slice(0, 6),
    improvements: improvementsRaw.map(toText).filter(Boolean).slice(0, 6),
  }
}

function parseJSONSafe(text: string) {
  try {
    return JSON.parse(text)
  } catch (_error) {
    return null
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const action = toText(body?.action)
    const jobTitle = toText(body?.jobTitle)
    const jobDescription = toText(body?.jobDescription)
    const resume = (body?.resume ?? null) as ResumeLike
    const interviewType = (toText(body?.interviewType) || 'technical') as InterviewType
    const difficulty = (toText(body?.difficulty) || 'medium') as InterviewDifficulty
    const messages = normalizeMessages(body?.messages)

    if (!jobTitle) {
      return new Response(
        JSON.stringify({ error: 'jobTitle 不能为空' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 开始新面试
    if (action === 'start') {
      const systemPrompt = `你是一位资深中文面试官，正在进行 ${getTypeLabel(interviewType)}。
职位：${jobTitle}
职位描述：${jobDescription || '未提供'}
难度：${getDifficultyLabel(difficulty)}
候选人简历摘要：
${summarizeResume(resume)}

面试规则：
1. 面试采用“欢迎开场 + 单个问题”格式，一次只问一个问题。
2. 问题要贴合职位、难度和候选人背景，避免空泛模板题。
3. 保持专业、友善、鼓励，问题简洁清晰。
4. 总轮次目标 5-8 轮（候选人回答轮次）。
5. 第一轮必须从自我介绍切入。`

      const greeting = await callLLM(
        systemPrompt,
        '请输出开场白并提出第一个问题。',
        buildInterviewLLMOptions({ temperature: 0.7 })
      )

      const message = toText(greeting)
      if (!message) {
        throw new Error('模型未返回开场问题')
      }

      return new Response(
        JSON.stringify({ message, status: 'active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 继续面试对话
    if (action === 'continue') {
      if (!messages.length) {
        return new Response(
          JSON.stringify({ error: 'continue 模式下 messages 不能为空' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const turnStats = getTurnStats(messages)
      const maxTurns = difficulty === 'hard' ? 8 : 6
      const shouldPrepareToEnd = turnStats.userTurns >= maxTurns

      const systemPrompt = `你是一位资深中文面试官，正在进行 ${getTypeLabel(interviewType)}。
职位：${jobTitle}
职位描述：${jobDescription || '未提供'}
难度：${getDifficultyLabel(difficulty)}
候选人简历摘要：
${summarizeResume(resume)}

请根据最新回答给出面试官下一句回复，并严格返回 JSON：
{
  "reply": "你的回复文本（可含一句简短反馈 + 下一个问题，或结束语）",
  "shouldEnd": true/false
}

规则：
1. 一次只提一个问题；如表现优秀可以提高深度，如薄弱需追问细节。
2. 优先避免连续重复同一类型问题。
3. 当候选人回答轮次达到 5-8 轮时，可自然收尾。
4. 若 shouldEnd=true，reply 应为结束面试的总结性话术，不再提新问题。
5. 除 JSON 外不要输出任何多余文本。`

      const userPrompt = `当前轮次信息：
- 候选人回答轮次：${turnStats.userTurns}
- 面试官提问轮次：${turnStats.aiTurns}
- 建议结束：${shouldPrepareToEnd ? '是' : '否'}

对话记录：
${buildTranscript(messages)}
`

      const raw = await callLLM(
        systemPrompt,
        userPrompt,
        buildInterviewLLMOptions({ temperature: 0.7, json: true })
      )
      const parsed = parseJSONSafe(raw)
      const reply = toText(parsed?.reply) || toText(raw)
      const shouldEnd = Boolean(parsed?.shouldEnd) || shouldPrepareToEnd

      if (!reply) {
        throw new Error('模型未返回继续面试内容')
      }

      return new Response(
        JSON.stringify({ message: reply, status: shouldEnd ? 'completed' : 'active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 结束面试，生成评估报告
    if (action === 'end') {
      if (!messages.length) {
        return new Response(
          JSON.stringify({ feedback: defaultFeedback, status: 'completed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const systemPrompt = `你是一位专业的AI面试评估师。请根据以下面试对话内容，生成一份综合评估报告。

评估维度：
1. communication: 沟通表达能力(0-100)
2. technical: 技术/专业能力(0-100)  
3. experience: 项目经验(0-100)
4. score: 综合评分(0-100)

请严格返回 JSON 格式评估报告，不要添加代码块标记。`

      const userPrompt = `面试职位: ${jobTitle}

面试对话记录:
${buildTranscript(messages)}

请生成评估报告，JSON格式:
{
  "score": 综合评分,
  "communication": 沟通分,
  "technical": 技术分,
  "experience": 经验分,
  "overall": "总体评价(200字左右)",
  "strengths": ["亮点1", "亮点2"],
  "improvements": ["改进建议1", "改进建议2"]
}`

      const result = await callLLM(
        systemPrompt,
        userPrompt,
        buildInterviewLLMOptions({ temperature: 0.3, json: true })
      )
      const feedback = normalizeFeedback(parseJSONSafe(result))

      return new Response(
        JSON.stringify({ feedback, status: 'completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), // 明确处理未知类型的 error
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
