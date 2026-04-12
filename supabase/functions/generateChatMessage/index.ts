// ============================================
// Edge Function: generateChatMessage
// 生成 AI 辅助聊天消息（智能回复建议）
// ============================================
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders, callLLM } from '../_shared/cors.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { context, role, recentMessages, jobInfo } = await req.json()

    const roleDesc = role === 'recruiter'
      ? '你是一位招聘者，正在与求职者沟通'
      : '你是一位求职者，正在与招聘者沟通'

    const systemPrompt = `${roleDesc}。

请根据聊天上下文，生成3条合适的回复建议。回复应该：
1. 自然、得体、专业
2. 符合当前聊天的语境
3. 长度适中（20-80字）
4. 分别代表不同的回复意图（如询问、确认、表达兴趣等）

请以 JSON 格式返回：
{
  "suggestions": ["建议1", "建议2", "建议3"]
}`

    const userPrompt = `职位信息: ${jobInfo ? `${jobInfo.title} - ${jobInfo.company}` : '未知'}

最近的聊天记录:
${recentMessages?.map((m: any) => `${m.role}: ${m.content}`).join('\n') || '暂无'}

${context ? `额外上下文: ${context}` : ''}

请生成3条回复建议。`

    const result = await callLLM(systemPrompt, userPrompt, { temperature: 0.8, json: true })
    const parsed = JSON.parse(result)

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
