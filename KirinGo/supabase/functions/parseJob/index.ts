// ============================================
// Edge Function: parseJob
// 解析职位描述，生成向量 embedding
// ============================================
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders, getEmbedding } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { jobId, title, description, requirements, tags } = await req.json()

    // 构建用于 embedding 的文本
    const embeddingText = `
职位: ${title}
描述: ${description}
要求: ${requirements}
技能标签: ${tags?.join(', ')}
`.trim()

    // 生成 embedding
    const embedding = await getEmbedding(embeddingText)

    // 存入数据库
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase
      .from('jobs')
      .update({ embedding })
      .eq('id', jobId)

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, embeddingLength: embedding.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
