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

      <div class="form-layout">
        <main class="form-main">
          <section class="form-section card">
            <h2 class="section-title text-display">基本信息</h2>
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label text-mono">职位名称</label>
                <input v-model="form.title" class="input" placeholder="如：高级前端开发工程师" />
              </div>
              <div class="form-group">
                <label class="form-label text-mono">工作城市</label>
                <input v-model="form.city" class="input" placeholder="如：北京" />
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
                <label class="form-label text-mono">薪资范围 (K)</label>
                <div class="salary-input-group">
                  <input v-model.number="form.salary_min" type="number" class="input" placeholder="最小" />
                  <span class="sep">-</span>
                  <input v-model.number="form.salary_max" type="number" class="input" placeholder="最大" />
                </div>
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
              <div class="form-group">
                <label class="form-label text-mono">职位标签 (逗号分隔)</label>
                <input v-model="tagsInput" class="input" placeholder="如：Vue, TypeScript, 架构" />
              </div>
            </div>
          </section>

          <section class="form-section card">
            <h2 class="section-title text-display">职位描述</h2>
            <div class="form-group">
              <label class="form-label text-mono">岗位职责</label>
              <textarea v-model="form.description" class="input text-serif" rows="8" placeholder="详细描述该岗位的日常工作内容..."></textarea>
            </div>
            <div class="form-group mt-6">
              <label class="form-label text-mono">任职要求</label>
              <textarea v-model="form.requirements" class="input text-serif" rows="8" placeholder="描述该岗位所需的技能、背景等要求..."></textarea>
            </div>
          </section>
        </main>

        <aside class="form-sidebar">
          <div class="sidebar-sticky">
            <div class="publish-card card">
              <h3 class="text-display mb-4">发布设置</h3>
              <div class="form-group mb-6">
                <label class="form-label text-mono">职位状态</label>
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

            <div class="ai-assist-card card mt-6">
              <div class="ai-header mb-4">
                <SparklesIcon class="icon-sm text-primary" />
                <span class="text-display ml-2">AI 辅助增强</span>
              </div>
              <p class="text-tiny text-secondary mb-4">AI 可以帮助您优化职位描述，使其更具吸引力并符合 SEO 规范。</p>
              <button class="btn btn-secondary btn-sm w-full" disabled>
                敬请期待 (Beta)
              </button>
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

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const tagsInput = ref('')

const form = reactive({
  title: '',
  city: '',
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

async function loadJobData() {
  if (!isEdit.value) return
  
  try {
    const job = await fetchJobById(route.params.id as string)
    if (job) {
      Object.assign(form, {
        title: job.title,
        city: job.city,
        job_type: job.job_type,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        experience: job.experience,
        education: job.education,
        description: job.description,
        requirements: job.requirements,
        status: job.status,
        tags: job.tags,
      })
      tagsInput.value = job.tags.join(', ')
    }
  } catch (error) {
    toast.error('加载职位数据失败')
  }
}

async function handleSubmit() {
  if (!form.title || !form.city || !form.description) {
    toast.error('请填写完整必填项')
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

onMounted(loadJobData)
</script>

<style scoped>
.post-job-page {
  padding: 60px 0 120px;
  background-color: var(--color-bg-canvas);
  min-height: calc(100vh - 80px);
}

.page-header-v2 {
  margin-bottom: 48px;
}

.form-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 40px;
  align-items: flex-start;
}

.form-section {
  padding: 40px;
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  margin-bottom: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.full-width {
  grid-column: span 2;
}

.salary-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.salary-input-group .sep {
  color: var(--color-text-tertiary);
}

.sidebar-sticky {
  position: sticky;
  top: 108px;
}

.publish-card {
  padding: 32px 24px;
}

.ai-assist-card {
  padding: 24px;
  background-color: var(--color-bg-surface-200);
}

.ai-header {
  display: flex;
  align-items: center;
}

@media (max-width: 1024px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
  .sidebar-sticky {
    position: static;
  }
}
</style>
