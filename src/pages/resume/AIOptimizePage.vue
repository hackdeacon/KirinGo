<template>
  <div class="ai-optimize-page">
    <div class="container-cursor">
      <button class="back-btn" @click="$router.back()">
        <ChevronLeftIcon class="icon-sm" /> 返回简历
      </button>

      <div class="page-header">
        <h1 class="text-heading">AI 简历深度优化</h1>
        <p class="text-body-serif">基于大语言模型的简历分析，提供针对性的专业改进建议。</p>
      </div>

      <!-- 优化流程 -->
      <div class="optimize-layout">
        <!-- 步骤指示 -->
        <div class="steps-bar card animate-fade-in">
          <div v-for="(step, i) in steps" :key="i" class="step-item" :class="{ active: currentStep >= i, done: currentStep > i }">
            <div class="step-dot text-mono">{{ currentStep > i ? '✓' : i + 1 }}</div>
            <span class="step-label text-mono">{{ step }}</span>
          </div>
        </div>

        <!-- 步骤1: 原始简历确认 -->
        <div v-if="currentStep === 0" class="step-content animate-fade-in-up">
          <div class="card step-card">
            <h3 class="text-subheading mb-6">确认待优化内容</h3>
            <div class="resume-preview-mini">
              <div class="preview-section" v-if="resume?.self_evaluation">
                <span class="preview-label text-mono">自我评价</span>
                <p class="text-serif">{{ resume.self_evaluation }}</p>
              </div>
              <div class="preview-section" v-for="exp in resume?.experience || []" :key="exp.company + exp.position">
                <span class="preview-label text-mono">工作经历：{{ exp.company }} — {{ exp.position }}</span>
                <p class="text-serif">{{ exp.description || '(暂无描述)' }}</p>
              </div>
              <div class="preview-section" v-for="proj in resume?.projects || []" :key="proj.name + proj.role">
                <span class="preview-label text-mono">项目经历：{{ proj.name }} — {{ proj.role }}</span>
                <p class="text-serif">{{ proj.description || '(暂无描述)' }}</p>
              </div>
              <div class="preview-section" v-if="resume?.skills?.length">
                <span class="preview-label text-mono">专业技能</span>
                <p class="text-mono">{{ resume.skills.join(', ') }}</p>
              </div>
            </div>
            <div class="flex-center-x">
              <button class="btn btn-orange btn-lg" @click="startOptimize" :disabled="optimizing" id="start-optimize-btn">
                <div v-if="optimizing" class="app-loading-spinner mr-2" style="width:16px;height:16px;"></div>
                <ZapIcon v-else class="icon-sm mr-2" />
                {{ optimizing ? 'AI 正在深度分析中...' : '开始 AI 智能优化' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 步骤2: AI 分析中 -->
        <div v-if="currentStep === 1" class="step-content animate-fade-in-up">
          <div class="card step-card analyzing-card">
            <div class="analyzing-animation">
              <div class="pulse-ring"></div>
              <div class="pulse-ring delay"></div>
              <ZapIcon class="analyzing-icon" />
            </div>
            <h3 class="text-subheading mb-8">AI 正在处理您的请求</h3>
            <div class="analyzing-steps">
              <div v-for="(item, i) in analyzeSteps" :key="i" class="analyze-step" :class="{ active: analyzeIndex >= i }">
                <CheckIcon v-if="analyzeIndex >= i" class="icon-sm text-success" />
                <div v-else class="app-loading-spinner" style="width:14px;height:14px;border-width:1.5px;"></div>
                <span class="text-mono">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤3: 优化结果 -->
        <div v-if="currentStep === 2" class="step-content animate-fade-in-up">
          <!-- 评分提升展示 -->
          <div class="score-showcase card">
            <div class="score-group">
              <div class="score-box">
                <span class="score-val text-display">{{ originalScore }}</span>
                <span class="score-lab text-mono">当前评分</span>
              </div>
              <div class="score-arrow">
                <ArrowRightIcon class="icon-lg" />
              </div>
              <div class="score-box highlight">
                <span class="score-val text-display">{{ optimizedScore }}</span>
                <span class="score-lab text-mono">优化后评分</span>
              </div>
            </div>
            <div class="improve-badge text-mono">
              PREDICTED IMPROVEMENT: +{{ optimizedScore - originalScore }}
            </div>
          </div>

          <!-- 优化建议列表 -->
          <div class="suggestions-container">
            <h2 class="text-mono mb-6">OPTIMIZATION SUGGESTIONS</h2>
            <div v-for="(sug, i) in suggestions" :key="i" class="suggestion-card card animate-fade-in" :style="{ animationDelay: `${i * 0.1}s` }">
              <div class="sug-header">
                <span class="tag-pill">{{ sug.category }}</span>
                <div class="flex-center text-success text-mono text-xs">
                  <SparklesIcon class="icon-xs mr-1" /> AI RECOMMENDED
                </div>
              </div>
              
              <div class="sug-compare-grid">
                <div class="sug-pane">
                  <div class="sug-pane-label text-mono">ORIGINAL</div>
                  <div class="sug-pane-content text-serif">{{ sug.original }}</div>
                </div>
                <div class="sug-pane optimized">
                  <div class="sug-pane-label text-mono">OPTIMIZED</div>
                  <div class="sug-pane-content text-serif">{{ sug.optimized }}</div>
                </div>
              </div>

              <div class="sug-footer">
                <div class="sug-reason">
                  <span class="text-mono text-xs block mb-1">RATIONALE:</span>
                  <p class="text-body-serif">{{ sug.reason }}</p>
                </div>
                <button class="btn btn-sm" :class="sug.applied ? 'btn-ghost' : 'btn-primary'" @click="applySuggestion(i)">
                  <CheckIcon v-if="sug.applied" class="icon-xs" />
                  {{ sug.applied ? '已采纳' : '采纳此建议' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 底部操作栏 -->
          <div class="sticky-action-bar">
            <div class="container-cursor flex-center-x gap-4">
              <button class="btn btn-orange btn-lg" @click="saveOptimized" id="save-optimized-btn">
                <SaveIcon class="icon-sm mr-2" /> 保存优化后的简历
              </button>
              <button class="btn btn-ghost btn-lg" @click="currentStep = 0">
                <RotateCcwIcon class="icon-sm mr-2" /> 重新分析
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createDefaultResume, fetchUserResume, saveResume } from '@/lib/database'
import { callLLMStream, LLM_API_KEY } from '@/lib/llmStream'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { Resume, ResumeAISuggestion } from '@/types'
import {
  ChevronLeft as ChevronLeftIcon,
  Zap as ZapIcon,
  Check as CheckIcon,
  ArrowRight as ArrowRightIcon,
  Sparkles as SparklesIcon,
  Save as SaveIcon,
  RotateCcw as RotateCcwIcon
} from 'lucide-vue-next'

const authStore = useAuthStore()
const toast = useToast()
const resume = ref<Resume | null>(null)
const currentStep = ref(0)
const optimizing = ref(false)
const analyzeIndex = ref(-1)
const originalScore = ref(0)
const optimizedScore = ref(0)
const optimizedEvaluation = ref('')

const steps = ['准备分析', 'AI 深度诊断', '查看优化建议']
const analyzeSteps = [
  '解析简历语义结构...',
  '诊断工作描述竞争力...',
  '评估行业关键词覆盖...',
  '生成专业级改进方案...',
  '预测综合评分提升...'
]

const suggestions = ref<Array<ResumeAISuggestion & { applied: boolean }>>([])

async function loadResume() {
  if (!authStore.user) return

  try {
    const existing = await fetchUserResume(authStore.user.id)
    resume.value = existing || await createDefaultResume(authStore.user)
    originalScore.value = resume.value.ai_score || 0
  } catch (error: any) {
    toast.error(`加载简历失败：${error?.message || '请稍后重试'}`)
  }
}

async function startOptimize() {
  if (!resume.value) return

  if (!LLM_API_KEY) {
    toast.error('LLM API Key 未配置，请检查 .env 文件 (需要 VITE_CHATANYWHERE_API_KEY 或 VITE_DEEPSEEK_API_KEY 或 VITE_OPENROUTER_API_KEY)')
    return
  }

  optimizing.value = true
  currentStep.value = 1
  analyzeIndex.value = -1

  const progressTimer = window.setInterval(() => {
    if (analyzeIndex.value < analyzeSteps.length - 1) {
      analyzeIndex.value += 1
    }
  }, 800)

  try {
    const systemPrompt = `你是一位资深的人力资源专家和简历优化师。你的任务是分析求职者的简历，给出专业的优化建议和优化后的内容。

请从以下维度进行分析：
1. 自我评价是否突出个人价值
2. 工作经历描述是否量化、有说服力
3. 项目经历是否突出技术亮点和成果
4. 技能是否按照重要程度排序
5. 整体结构是否符合行业最佳实践

返回 JSON 格式的优化建议。`

    const userPrompt = `请分析并优化以下简历内容：

姓名：${resume.value.basic_info?.name}
自我评价：${resume.value.self_evaluation}
工作经历：${JSON.stringify(resume.value.experience)}
项目经历：${JSON.stringify(resume.value.projects)}
技能：${resume.value.skills?.join(', ')}

重要规则：
- 对于工作经历和项目经历，你只优化描述部分（description 字段）
- 请不要修改时间（start/end）、公司名称、职位名称、项目名称、角色名称
- original 字段只放描述部分的原文，不要包含时间、公司、职位
- 优化只针对描述内容，让它更加量化、突出成果和影响力

请以以下 JSON 格式返回：
{
  "score": 简历评分(0-100),
  "optimized_evaluation": "优化后的自我评价",
  "suggestions": [
    {
      "category": "分类(自我评价/工作经历/项目经历/技能描述)",
      "original": "原文(描述部分)",
      "optimized": "优化后的文本",
      "reason": "优化原因"
    }
  ],
  "overall_feedback": "总体反馈"
}`

    const resultText = await callLLMStream(systemPrompt, userPrompt, true)
    const result = JSON.parse(resultText)

    optimizedScore.value = result.score
    optimizedEvaluation.value = result.optimized_evaluation || ''
    suggestions.value = (result.suggestions || []).map((item: ResumeAISuggestion) => ({
      ...item,
      applied: false,
    }))
    analyzeIndex.value = analyzeSteps.length - 1

    // 延迟进入下一步，确保用户看到最后一个勾选
    setTimeout(() => {
      currentStep.value = 2
    }, 500)
  } catch (error: any) {
    toast.error(`AI 优化服务暂时不可用：${error?.message || '请稍后重试'}`)
    currentStep.value = 0
  } finally {
    window.clearInterval(progressTimer)
    optimizing.value = false
  }
}

function applySuggestion(index: number) {
  const sug = suggestions.value[index]
  sug.applied = true

  // 真正应用优化内容到简历数据
  if (!resume.value) return

  switch (sug.category) {
    case '自我评价':
      resume.value.self_evaluation = sug.optimized
      break
    case '工作经历':
      // 模糊匹配找到对应工作经历进行更新
      if (resume.value.experience) {
        // First try exact match
        let exp = resume.value.experience.find(e => e.description === sug.original)
        if (!exp) {
          // If no exact match, try fuzzy match - description contains original text
          const originalClean = sug.original.trim().toLowerCase()
          exp = resume.value.experience.find(e =>
            e.description?.trim().toLowerCase().includes(originalClean)
          )
        }
        if (exp) {
          exp.description = sug.optimized
        } else {
          toast.warn(`未找到匹配的工作经历，请手动复制：\n${sug.optimized}`)
        }
      }
      break
    case '项目经历':
      // 模糊匹配找到对应项目经历进行更新
      if (resume.value.projects) {
        // First try exact match
        let proj = resume.value.projects.find(p => p.description === sug.original)
        if (!proj) {
          // If no exact match, try fuzzy match - description contains original text
          const originalClean = sug.original.trim().toLowerCase()
          proj = resume.value.projects.find(p =>
            p.description?.trim().toLowerCase().includes(originalClean)
          )
        }
        if (proj) {
          proj.description = sug.optimized
        } else {
          toast.warn(`未找到匹配的项目经历，请手动复制：\n${sug.optimized}`)
        }
      }
      break
    case '技能描述':
      // 技能整体替换
      resume.value.skills = sug.optimized.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
      break
  }

  toast.success('已应用优化方案')
}

async function saveOptimized() {
  if (!authStore.user) {
    toast.error('请先登录')
    return
  }
  if (!resume.value) {
    toast.error('简历数据不存在，请刷新重试')
    return
  }

  try {
    // 所有采纳的修改已经实时应用到 resume.value 了
    // 这里只需要额外处理 AI 评分和建议列表
    const updatedResume = await saveResume(authStore.user.id, {
      ...resume.value,
      basic_info: {
        ...resume.value.basic_info,
      },
      ai_score: optimizedScore.value,
      ai_suggestions: suggestions.value.map(({ applied, ...rest }) => rest),
    })

    resume.value = updatedResume
    originalScore.value = resume.value.ai_score
    toast.success('优化后的简历已保存！返回简历即可看到更新')
  } catch (error: any) {
    toast.error(`保存失败：${error?.message || '请重试'}`)
  }
}

onMounted(() => {
  loadResume()
})
</script>

<style scoped>
.ai-optimize-page {
  padding: 60px 0 180px;
  background-color: var(--color-bg-canvas);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-family: var(--font-display);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 32px;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--color-primary);
}

.page-header {
  margin-bottom: 48px;
}

/* 步骤条 */
.steps-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 64px;
  padding: 32px;
  background-color: var(--color-bg-surface-200);
  margin-bottom: 48px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text-tertiary);
}

.step-item.active { color: var(--color-text-primary); }
.step-item.done { color: var(--color-primary); }

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.step-item.active .step-dot {
  border-color: var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-bg-canvas);
}

.step-item.done .step-dot {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.step-label {
  font-size: 12px;
  letter-spacing: 0.05em;
}

/* 步骤卡片 */
.step-card {
  padding: 48px;
  background-color: var(--color-bg-surface-200);
}

.resume-preview-mini {
  margin-bottom: 48px;
  max-height: 480px;
  overflow-y: auto;
  padding: 32px;
  background: var(--color-bg-surface-300);
  border-radius: var(--radius-md);
}

.preview-section {
  padding: 24px 0;
  border-bottom: 1px solid var(--color-border);
}

.preview-section:last-child { border-bottom: none; }

.preview-label {
  display: block;
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-bottom: 12px;
  text-transform: uppercase;
}

/* 分析动画 */
.analyzing-card {
  text-align: center;
  padding: 80px 40px;
}

.analyzing-animation {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid var(--color-primary);
  animation: pulseRing 2.5s ease-out infinite;
}

.pulse-ring.delay { animation-delay: 1.25s; }

@keyframes pulseRing {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2.2); opacity: 0; }
}

.analyzing-icon {
  width: 48px;
  height: 48px;
  color: var(--color-primary);
  z-index: 1;
}

.analyzing-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
  max-width: 280px;
  margin: 0 auto;
}

.analyze-step {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 15px;
  color: var(--color-text-tertiary);
  transition: all 0.3s;
}

.analyze-step.active { color: var(--color-text-primary); }

/* 结果展示 */
.score-showcase {
  padding: 48px;
  background-color: var(--color-text-primary);
  color: var(--color-bg-canvas);
  text-align: center;
  margin-bottom: 64px;
}

.score-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 64px;
  margin-bottom: 32px;
}

.score-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0.6;
}

.score-box.highlight {
  opacity: 1;
  color: var(--color-primary);
}

.score-val { font-size: 64px; line-height: 1; }
.score-lab { font-size: 12px; text-transform: uppercase; }
.score-arrow { color: rgba(242, 241, 237, 0.2); }

.improve-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(242, 241, 237, 0.1);
  border-radius: var(--radius-pill);
  font-size: 11px;
}

/* 建议卡片 */
.suggestions-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.suggestion-card {
  padding: 40px;
  background-color: var(--color-bg-surface-200);
}

.sug-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.sug-compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.sug-pane {
  padding: 24px;
  background: var(--color-bg-surface-300);
  border-radius: var(--radius-md);
}

.sug-pane.optimized {
  background: rgba(245, 78, 0, 0.03);
  border: 1px solid rgba(245, 78, 0, 0.1);
}

.sug-pane-label {
  font-size: 10px;
  color: var(--color-text-tertiary);
  margin-bottom: 16px;
}

.sug-pane-content {
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.optimized .sug-pane-content {
  color: var(--color-text-primary);
}

.sug-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  padding-top: 32px;
  border-top: 1px solid var(--color-border);
}

.sug-reason { flex: 1; }

/* 底部栏 */
.sticky-action-bar {
  position: fixed;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  right: 0;
  padding: 24px 0 calc(24px + env(safe-area-inset-bottom));
  background: rgba(242, 241, 237, 0.8);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--color-border);
  z-index: 200;
}

.flex-center-x { display: flex; justify-content: center; align-items: center; }
.flex-center { display: flex; align-items: center; }
.gap-4 { gap: 16px; }
.mr-2 { margin-right: 8px; }
.mb-8 { margin-bottom: 32px; }
.block { display: block; }
.text-xs { font-size: 12px; }

@media (max-width: 834px) {
  .sug-compare-grid { grid-template-columns: 1fr; }
  .score-group { gap: 32px; }
  .score-val { font-size: 48px; }
}

@media (max-width: 768px) {
  .steps-bar { gap: 24px; padding: 20px; }
  .step-label { display: none; }
  .sug-footer { flex-direction: column; align-items: stretch; }
  .sug-footer .btn { width: 100%; }
  .score-group { flex-direction: column; gap: 24px; }
  .score-arrow { transform: rotate(90deg); }
}
</style>
