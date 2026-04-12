// ============================================
// Edge Function: interviewAI
// AI 模拟面试 - 多轮对话
// ============================================
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders, callLLM } from '../_shared/cors.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { jobTitle, jobDescription, messages, action, resume } = await req.json()

    // 开始新面试
    if (action === 'start') {
      const systemPrompt = `你是一位专业的AI面试官，正在面试"${jobTitle}"岗位的候选人。

面试规则：
1. 面试分为自我介绍、技术/专业能力、项目经验、行为面试、职业规划五个环节
2. 每次只问一个问题，等待候选人回答后再提下一个问题
3. 根据候选人的回答适当追问或引导
4. 语气专业、友善、鼓励
5. 面试大约进行5-8轮对话

请先做简短的开场白，然后请候选人做自我介绍。`

      const greeting = await callLLM(systemPrompt, '请开始面试。', { temperature: 0.7 })

      return new Response(
        JSON.stringify({ message: greeting, status: 'active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 继续面试对话
    if (action === 'continue') {
      const systemPrompt = `你是一位专业的AI面试官，正在面试"${jobTitle}"岗位的候选人。

职位描述：${jobDescription || ''}

面试规则：
1. 仔细倾听候选人的回答
2. 根据回答质量给予简短反馈
3. 自然过渡到下一个问题
4. 如果已经进行了足够多轮对话(5-8轮)，可以适当结束面试
5. 保持专业友善的态度

候选人简历概要：${resume ? JSON.stringify(resume) : '未提供'}`

      // 构建历史对话
      const systemPromptWithHistory = `你是一位专业的AI面试官，正在面试"${jobTitle}"岗位的候选人。

职位描述：${jobDescription || ''}

面试规则：
1. 仔细倾听候选人的回答
2. 根据回答质量给予简短反馈
3. 自然过渡到下一个问题
4. 如果已经进行了足够多轮对话(5-8轮)，可以适当结束面试
5. 保持专业友善的态度

候选人简历概要：${resume ? JSON.stringify(resume) : '未提供'}

对话记录：
${messages.map((m: any) => `${m.role === 'ai' ? '面试官' : '候选人'}: ${m.content}`).join('\n')}

请生成下一句面试官的回复。`

      const aiMessage = await callLLM('', systemPromptWithHistory, { temperature: 0.7 })

      return new Response(
        JSON.stringify({ message: aiMessage, status: 'active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 结束面试，生成评估报告
    if (action === 'end') {
      const systemPrompt = `你是一位专业的AI面试评估师。请根据以下面试对话内容，生成一份综合评估报告。

评估维度：
1. communication: 沟通表达能力(0-100)
2. technical: 技术/专业能力(0-100)  
3. experience: 项目经验(0-100)
4. score: 综合评分(0-100)

请返回 JSON 格式的评估报告。`

      const userPrompt = `面试职位: ${jobTitle}

面试对话记录:
${messages.map((m: any) => `${m.role === 'ai' ? '面试官' : '候选人'}: ${m.content}`).join('\n\n')}

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

      const result = await callLLM(systemPrompt, userPrompt, { temperature: 0.3, json: true })
      const feedback = JSON.parse(result)

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
