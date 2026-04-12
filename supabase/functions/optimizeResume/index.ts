// ============================================
// Edge Function: optimizeResume
// AI 优化简历内容
// ============================================
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders, callLLM } from '../_shared/cors.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { resume } = await req.json()

    const systemPrompt = `你是一位资深的人力资源专家和简历优化师。你的任务是分析求职者的简历，给出专业的优化建议和优化后的内容。

请从以下维度进行分析：
1. 自我评价是否突出个人价值
2. 工作经历描述是否量化、有说服力
3. 项目经历是否突出技术亮点和成果
4. 技能是否按照重要程度排序
5. 整体结构是否符合行业最佳实践

返回 JSON 格式的优化建议。`

    const userPrompt = `请分析并优化以下简历内容：

姓名：${resume.basic_info?.name}
自我评价：${resume.self_evaluation}
工作经历：${JSON.stringify(resume.experience)}
项目经历：${JSON.stringify(resume.projects)}
技能：${resume.skills?.join(', ')}

请以以下 JSON 格式返回：
{
  "score": 简历评分(0-100),
  "optimized_evaluation": "优化后的自我评价",
  "suggestions": [
    {
      "category": "分类(自我评价/工作经历/项目经历/技能描述)",
      "original": "原文",
      "optimized": "优化后的文本",
      "reason": "优化原因"
    }
  ],
  "overall_feedback": "总体反馈"
}`

    const result = await callLLM(systemPrompt, userPrompt, { temperature: 0.3, json: true })
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
