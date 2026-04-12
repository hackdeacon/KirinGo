// ============================================
// Edge Function: parseResume
// 解析简历文件，提取结构化信息
// ============================================
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders, callLLM } from '../_shared/cors.ts'

serve(async (req: Request) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { fileContent, fileType } = await req.json()

    // 调用 LLM 解析简历
    const systemPrompt = `你是一个专业的简历解析器。请从简历内容中提取结构化信息，并以 JSON 格式返回。`
    const userPrompt = `简历内容：\n${fileContent}\n\n请严格按以下 JSON 格式返回：
{
  "basic_info": {
    "name": "姓名",
    "gender": "性别",
    "age": 年龄数字,
    "phone": "手机号",
    "email": "邮箱",
    "city": "城市"
  },
  "education": [
    {
      "school": "学校",
      "degree": "学位",
      "major": "专业",
      "start": "开始时间",
      "end": "结束时间"
    }
  ],
  "experience": [
    {
      "company": "公司",
      "position": "职位",
      "start": "开始时间",
      "end": "结束时间",
      "description": "工作描述"
    }
  ],
  "skills": ["技能1", "技能2"],
  "projects": [
    {
      "name": "项目名",
      "role": "角色",
      "description": "项目描述",
      "start": "开始时间",
      "end": "结束时间"
    }
  ],
  "certificates": ["证书1"],
  "self_evaluation": "自我评价"
}

仅返回 JSON，不要其他文字。`

    const result = await callLLM(systemPrompt, userPrompt, { temperature: 0.1, json: true })
    const parsed = JSON.parse(result)

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
