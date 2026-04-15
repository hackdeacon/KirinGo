<template>
  <div class="post-job-page animate-fade-in">
    <div class="container-cursor">
      <div class="page-header-v2">
        <div class="header-left">
          <button class="btn btn-ghost btn-sm mb-4" @click="$router.back()">
            <ArrowLeftIcon class="icon-xs mr-1" /> 返回
          </button>
          <h1 class="text-display text-3xl mb-2">{{ isEdit ? '编辑职位' : '发布新职位' }}</h1>
          <p class="text-body-serif text-tertiary">填写职位详细信息，吸引最合适的牛人。</p>
        </div>
      </div>

      <!-- 加载骨架屏 -->
      <div v-if="isEdit && loading" class="form-layout">
        <main class="form-main">
          <div class="form-section card skeleton-block">
            <div class="skeleton-title"></div>
            <div class="skeleton-grid">
              <div class="skeleton-item full-width"></div>
              <div class="skeleton-item"></div>
              <div class="skeleton-item"></div>
              <div class="skeleton-item"></div>
              <div class="skeleton-item"></div>
              <div class="skeleton-item"></div>
              <div class="skeleton-item"></div>
            </div>
          </div>
          <div class="form-section card skeleton-block">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text mt-6"></div>
          </div>
        </main>
        <aside class="form-sidebar">
          <div class="sidebar-sticky">
            <div class="publish-card card skeleton-block"></div>
            <div class="ai-assist-card card mt-6 skeleton-block"></div>
          </div>
        </aside>
      </div>

      <div v-else class="form-layout">
        <main class="form-main">
          <section class="form-section card">
            <h2 class="section-title text-display">基本信息</h2>
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label text-mono">职位名称 <span class="required">*</span></label>
                <input v-model="form.title" class="input" placeholder="如：高级前端开发工程师" />
              </div>
              <div class="form-group">
                <label class="form-label text-mono">工作城市 <span class="required">*</span></label>
                <input v-model="form.city" class="input" placeholder="如：北京" />
              </div>
              <div class="form-group">
                <label class="form-label text-mono">所在区域</label>
                <input v-model="form.district" class="input" placeholder="如：朝阳区" />
              </div>
              <div class="form-group">
                <label class="form-label text-mono">职位类型</label>
                <select v-model="form.job_type" class="input">
                  <option value="全职">全职</option>
                  <option value="兼职">兼职</option>
                  <option value="实习">实习</option>
                  <option value="远程">远程</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label text-mono">薪资范围 (K·千元/月) <span class="required">*</span></label>
                <div class="salary-input-group">
                  <input v-model.number="form.salary_min" type="number" min="0" class="input" placeholder="最小" />
                  <span class="sep">-</span>
                  <input v-model.number="form.salary_max" type="number" min="0" class="input" placeholder="最大" />
                </div>
                <p v-if="salaryError" class="text-tiny text-error mt-2">{{ salaryError }}</p>
              </div>
              <div class="form-group">
                <label class="form-label text-mono">经验要求</label>
                <select v-model="form.experience" class="input">
                  <option value="不限">不限</option>
                  <option value="应届生">应届生</option>
                  <option value="1-3年">1-3年</option>
                  <option value="3-5年">3-5年</option>
                  <option value="5-10年">5-10年</option>
                  <option value="10年以上">10年以上</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label text-mono">学历要求</label>
                <select v-model="form.education" class="input">
                  <option value="不限">不限</option>
                  <option value="大专">大专</option>
                  <option value="本科">本科</option>
                  <option value="硕士">硕士</option>
                  <option value="博士">博士</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label class="form-label text-mono">职位标签 <span class="optional">(逗号分隔)</span></label>
                <input v-model="tagsInput" class="input" placeholder="如：Vue, TypeScript, 架构，前端" />
                <div class="tags-preview" v-if="tagsPreview.length">
                  <span v-for="tag in tagsPreview" :key="tag" class="tag-pill">{{ tag }}</span>
                </div>
              </div>
            </div>
          </section>

          <section class="form-section card">
            <h2 class="section-title text-display">职位描述</h2>
            <div class="form-group">
              <label class="form-label text-mono">岗位职责 <span class="required">*</span></label>
              <textarea v-model="form.description" class="input text-serif" rows="8" placeholder="详细描述该岗位的日常工作内容...
例如：
1. 负责产品前端架构设计和功能开发
2. 与产品、设计和后端团队紧密协作
3. 持续优化前端体验和性能..."></textarea>
            </div>
            <div class="form-group mt-6">
              <label class="form-label text-mono">任职要求 <span class="required">*</span></label>
              <textarea v-model="form.requirements" class="input text-serif" rows="8" placeholder="描述该岗位所需的技能、背景等要求...
例如：
1. 本科及以上学历，计算机相关专业
2. 3年以上前端开发经验，精通 Vue/React
3. 具备良好的代码风格和工程素养..."></textarea>
            </div>
          </section>
        </main>

        <aside class="form-sidebar">
          <div class="sidebar-sticky">
            <div class="publish-card">
              <h3 class="text-display">发布设置</h3>
              <div class="publish-form-group">
                <label class="form-label text-mono">发布选项</label>
                <select v-model="form.status" class="input">
                  <option value="active">立即发布</option>
                  <option value="draft">保存为草稿</option>
                  <option value="closed">暂时关闭</option>
                </select>
              </div>
              <button class="btn btn-primary w-full py-3" @click="handleSubmit" :disabled="submitting">
                <component :is="submitting ? LoaderIcon : SaveIcon" class="icon-sm mr-2" :class="{ 'animate-spin': submitting }" />
                {{ isEdit ? '保存更改' : '确认发布' }}
              </button>
              <p class="text-tiny text-tertiary mt-4 text-center">
                发布即表示您同意 麒麟智聘 的<router-link to="/terms" class="link">职位发布规范</router-link>。
              </p>
            </div>

            <div class="ai-assist-card">
              <div class="ai-header">
                <SparklesIcon class="icon-sm" />
                <span class="text-display">AI 辅助增强</span>
              </div>
              <p>AI 可以帮助您优化职位描述，使其更清晰、更专业，吸引更多优质候选人。</p>
              <button class="btn btn-secondary w-full" @click="handleAIOptimize" :disabled="aiOptimizing || !canOptimize">
                <component :is="aiOptimizing ? LoaderIcon : SparklesIcon" class="icon-sm mr-2" :class="{ 'animate-spin': aiOptimizing }" />
                {{ aiOptimizing ? '优化中...' : 'AI 优化描述' }}
              </button>
              <p class="text-tiny text-tertiary" v-if="!canOptimize">请先填写岗位职责和要求</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchJobById, createJob, updateJob, fetchCompanyByRecruiter } from '@/lib/database'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import {
  ArrowLeft as ArrowLeftIcon,
  Save as SaveIcon,
  Loader2 as LoaderIcon,
  Sparkles as SparklesIcon
} from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const loading = ref(true)
const aiOptimizing = ref(false)
const tagsInput = ref('')

const form = reactive({
  title: '',
  city: '',
  district: '',
  job_type: '全职',
  salary_min: 0,
  salary_max: 0,
  experience: '不限',
  education: '不限',
  description: '',
  requirements: '',
  status: 'active' as 'active' | 'draft' | 'closed',
  tags: [] as string[],
})

const tagsPreview = computed(() => {
  return tagsInput.value.split(',')
    .map(t => t.trim())
    .filter(Boolean)
    .slice(0, 10)
})

const salaryError = computed(() => {
  if (form.salary_min <= 0 || form.salary_max <= 0) {
    return '请填写有效的薪资范围'
  }
  if (form.salary_min > form.salary_max) {
    return '最低工资不能高于最高工资'
  }
  return null
})

const canOptimize = computed(() => {
  return form.description.trim().length > 10 || form.requirements.trim().length > 10
})

async function loadJobData() {
  loading.value = true
  if (!isEdit.value) {
    loading.value = false
    return
  }

  try {
    const job = await fetchJobById(route.params.id as string)
    if (job) {
      Object.assign(form, {
        title: job.title,
        city: job.city,
        district: job.district || '',
        job_type: job.job_type,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        experience: job.experience,
        education: job.education,
        description: job.description,
        requirements: job.requirements,
        status: job.status,
        tags: job.tags || [],
      })
      tagsInput.value = (job.tags || []).join(', ')
    }
  } catch (error) {
    console.error('加载职位数据失败:', error)
    toast.error('加载职位数据失败')
  } finally {
    loading.value = false
  }
}

// AI 优化职位描述
async function handleAIOptimize() {
  if (!canOptimize.value || !isSupabaseConfigured) {
    if (!isSupabaseConfigured) {
      toast.error('请先配置 Supabase 才能使用 AI 功能')
    }
    return
  }

  aiOptimizing.value = true
  try {
    const { data, error } = await supabase.functions.invoke('parseJob', {
      body: {
        title: form.title,
        description: form.description,
        requirements: form.requirements,
      }
    })

    if (error) throw error

    if (data?.optimized) {
      if (data.optimized.description && data.optimized.description !== form.description) {
        form.description = data.optimized.description
      }
      if (data.optimized.requirements && data.optimized.requirements !== form.requirements) {
        form.requirements = data.optimized.requirements
      }
      toast.success('AI 优化完成！已为您改进了职位描述')
    } else {
      toast.info('AI 分析完成，当前描述已经很完善了')
    }
  } catch (error: any) {
    console.error('AI 优化失败:', error)
    toast.error('AI 优化失败，请稍后重试')
  } finally {
    aiOptimizing.value = false
  }
}

async function handleSubmit() {
  // 完整验证
  if (!form.title.trim()) {
    toast.error('请输入职位名称')
    return
  }
  if (!form.city.trim()) {
    toast.error('请输入工作城市')
    return
  }
  if (!form.description.trim()) {
    toast.error('请填写岗位职责')
    return
  }
  if (salaryError.value) {
    toast.error(salaryError.value)
    return
  }

  submitting.value = true
  form.tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)

  try {
    const recruiterId = authStore.user?.id
    if (!recruiterId) throw new Error('未登录')

    const company = await fetchCompanyByRecruiter(recruiterId)
    if (!company) {
      toast.error('请先完善公司信息')
      router.push('/recruiter/company/settings')
      return
    }

    const jobData = {
      ...form,
      recruiter_id: recruiterId,
      company_id: company.id,
    }

    if (isEdit.value) {
      await updateJob(route.params.id as string, jobData)
      toast.success('职位已更新')
    } else {
      await createJob(jobData)
      toast.success('职位已发布')
    }
    router.push('/recruiter/jobs')
  } catch (error: any) {
    toast.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL)
  && import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co'

onMounted(loadJobData)
</script>

<style scoped>
.post-job-page {
  padding: 60px 0 120px;
  background-color: var(--color-bg-canvas);
  min-height: calc(100vh - 80px);
}

.page-header-v2 {
  margin-bottom: 40px;
}

.form-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 48px;
  align-items: start;
}

.form-main {
  width: 100%;
}

.form-section {
  padding: 44px 40px;
  margin-bottom: 32px;
  background: var(--color-bg-surface-100);
  border: 1px solid rgba(38, 37, 30, 0.1);
  border-radius: 10px;
}

.section-title {
  font-size: 22px;
  margin-bottom: 36px;
  letter-spacing: -0.11px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}

.full-width {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  letter-spacing: 0.14px;
}

.form-label .required {
  color: var(--color-error);
  margin-left: 4px;
}

.form-label .optional {
  color: var(--color-text-tertiary);
  font-weight: 400;
  font-size: 12px;
}

.input {
  padding: 10px 12px 8px;
}

.salary-input-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.salary-input-group .sep {
  color: var(--color-text-tertiary);
  font-size: 16px;
}

.text-error {
  color: var(--color-error);
}

.tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tag-pill {
  font-size: 12px;
  padding: 4px 12px;
  background: var(--color-bg-surface-300);
  color: var(--color-text-secondary);
  border-radius: 9999px;
  border: 1px solid rgba(38, 37, 30, 0.1);
}

.form-sidebar {
  width: 100%;
}

.sidebar-sticky {
  position: sticky;
  top: 108px;
}

.publish-card {
  padding: 28px 24px;
  background: var(--color-bg-surface-100);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.02),
    0 8px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.publish-card:hover {
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.02),
    0 12px 32px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.publish-card h3 {
  font-size: 18px;
  margin-bottom: 20px;
  letter-spacing: -0.11px;
  color: var(--color-text-primary);
}

.publish-card .btn {
  padding-top: 12px;
  padding-bottom: 12px;
  font-size: 15px;
  letter-spacing: -0.14px;
  border-radius: 10px;
}

.publish-card p {
  line-height: 1.5;
  color: var(--color-text-tertiary);
}

.publish-form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.ai-assist-card {
  padding: 24px 20px;
  background: linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 10%, transparent) 0%, var(--color-bg-surface-100) 100%);
  border: 1px solid color-mix(in oklab, var(--color-primary) 30%, transparent);
  border-radius: 16px;
  margin-top: 20px;
  transition: all 0.2s ease;
}

.ai-assist-card:hover {
  box-shadow: 
    0 4px 12px color-mix(in oklab, var(--color-primary) 10%, transparent),
    0 12px 40px color-mix(in oklab, var(--color-primary) 4%, transparent);
  transform: translateY(-2px);
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-top: 4px;
}

.ai-header .icon-sm {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
  filter: drop-shadow(0 1px 2px color-mix(in oklab, var(--color-primary) 20%, transparent));
}

.ai-header span {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.11px;
  color: var(--color-text-primary);
}

.ai-assist-card p {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.ai-assist-card .btn {
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 10px;
  background: color-mix(in oklab, var(--color-primary) 12%, transparent);
  border: 1px solid color-mix(in oklab, var(--color-primary) 25%, transparent);
  color: var(--color-primary);
  font-weight: 500;
  transition: all 0.2s ease;
}

.ai-assist-card .btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in oklab, var(--color-primary) 30%, transparent);
}

.ai-assist-card .text-tiny {
  margin-top: 10px;
  line-height: 1.5;
  color: var(--color-text-tertiary);
}

/* Skeleton Loading */
.skeleton-block {
  background: var(--color-bg-surface-200);
  position: relative;
  overflow: hidden;
  border-radius: 10px;
}

.skeleton-title {
  height: 26px;
  width: 40%;
  background: var(--color-bg-surface-300);
  border-radius: 4px;
  margin-bottom: 32px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}

.skeleton-item {
  height: 44px;
  background: var(--color-bg-surface-300);
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-item.full-width {
  grid-column: span 2;
  height: 44px;
}

.skeleton-text {
  height: 140px;
  background: var(--color-bg-surface-300);
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.3; }
}

@media (max-width: 1024px) {
  .form-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .sidebar-sticky {
    position: static;
  }
}

@media (max-width: 640px) {
  .post-job-page {
    padding: 40px 0 100px;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .full-width {
    grid-column: span 1;
  }
  .form-section {
    padding: 28px 20px;
    margin-bottom: 24px;
  }
  .section-title {
    margin-bottom: 28px;
  }
}
</style>
