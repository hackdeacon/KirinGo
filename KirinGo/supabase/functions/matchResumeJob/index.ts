// ============================================
// Edge Function: matchResumeJob
// AI 简历-职位匹配分析
// ============================================
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders, callLLM } from '../_shared/cors.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { resume, job } = await req.json()

    const systemPrompt = `你是一位专业的AI招聘匹配分析师。你需要分析求职者简历和目标职位的匹配程度，从多个维度给出客观评分和分析。

评分范围: 0-100
评分维度:
- skills: 技能匹配度
- experience: 工作经验匹配度
- education: 教育背景匹配度
- location: 工作地点匹配度

请返回严格的 JSON 格式。`

    const userPrompt = `请分析以下简历和职位的匹配度：

【求职者简历】
- 姓名: ${resume.basic_info?.name}
- 城市: ${resume.basic_info?.city}
- 技能: ${resume.skills?.join(', ')}
- 教育: ${resume.education?.map((e: any) => `${e.school} ${e.degree} ${e.major}`).join('; ')}
- 工作经历: ${resume.experience?.map((e: any) => `${e.company} ${e.position}: ${e.description}`).join('; ')}

【目标职位】
- 职位: ${job.title}
- 公司: ${job.company_name}
- 城市: ${job.city}
- 薪资: ${job.salary_min}-${job.salary_max}K
- 要求: ${job.requirements}
- 技能标签: ${job.tags?.join(', ')}
- 经验要求: ${job.experience}
- 学历要求: ${job.education}

请返回以下 JSON 格式:
{
  "score": 总分(0-100),
  "dimensions": {
    "skills": 技能分(0-100),
    "experience": 经验分(0-100),
    "education": 教育分(0-100),
    "location": 地点分(0-100)
  },
  "strengths": ["优势1", "优势2"],
  "gaps": ["不足1", "不足2"],
  "suggestions": ["建议1", "建议2"]
}`

    const result = await callLLM(systemPrompt, userPrompt, { temperature: 0.2, json: true })
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
