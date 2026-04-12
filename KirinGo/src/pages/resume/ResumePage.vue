<template>
  <div class="resume-page">
    <div class="container-cursor">
      <div class="page-header">
        <h1 class="text-heading">我的简历</h1>
        <div class="header-actions">
          <router-link to="/resume/ai-optimize" class="btn btn-orange" id="ai-optimize-btn">
            <ZapIcon class="icon-sm" /> AI 优化简历
          </router-link>
        </div>
      </div>

      <div v-if="loading" class="loading-state card">
        <div class="app-loading-spinner"></div>
        <span class="text-mono">正在加载简历数据...</span>
      </div>

      <div class="resume-layout">
        <div class="resume-main">
          <!-- 简历预览 -->
          <div class="resume-preview card animate-fade-in-up">
            <!-- 基本信息 -->
            <div class="resume-section no-border">
              <div class="resume-header-info">
                <AppAvatar class="resume-avatar" :src="authStore.user?.avatar_url" :alt="resume.basic_info.name || '简历头像'" size="xl" />
                <div class="resume-basic">
                  <h2 class="text-subheading">{{ resume.basic_info.name || '未填写姓名' }}</h2>
                  <div class="resume-meta-row text-mono">
                    <span v-if="resume.basic_info.gender">{{ resume.basic_info.gender }}</span>
                    <span v-if="resume.basic_info.age">{{ resume.basic_info.age }} 岁</span>
                    <span v-if="resume.basic_info.city" class="flex-center">
                      <MapPinIcon class="icon-xs mr-1" /> {{ resume.basic_info.city }}
                    </span>
                  </div>
                  <div class="resume-contact-row text-mono">
                    <span v-if="resume.basic_info.phone" class="flex-center">
                      <PhoneIcon class="icon-xs mr-1" /> {{ resume.basic_info.phone }}
                    </span>
                    <span v-if="resume.basic_info.email" class="flex-center">
                      <MailIcon class="icon-xs mr-1" /> {{ resume.basic_info.email }}
                    </span>
                  </div>
                  <div class="resume-contact-row text-mono" v-if="resume.basic_info.github || resume.basic_info.website">
                    <a v-if="resume.basic_info.github" :href="resume.basic_info.github" target="_blank" class="flex-center link">
                      <GithubIcon class="icon-xs mr-1" /> GitHub
                    </a>
                    <a v-if="resume.basic_info.website" :href="resume.basic_info.website" target="_blank" class="flex-center link">
                      <GlobeIcon class="icon-xs mr-1" /> 个人主页
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- 自我评价 -->
            <div class="resume-section">
              <h3 class="resume-section-title">
                <UserIcon class="icon-sm" /> 自我评价
              </h3>
              <p class="text-serif section-content">{{ resume.self_evaluation || '暂无自我评价' }}</p>
            </div>

            <!-- 工作经历 -->
            <div class="resume-section">
              <h3 class="resume-section-title">
                <BriefcaseIcon class="icon-sm" /> 工作经历
              </h3>
              <div v-if="resume.experience?.length" class="timeline">
                <div v-for="exp in resume.experience" :key="exp.company" class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <span class="timeline-main text-display">{{ exp.company }}</span>
                      <span class="timeline-date text-mono">{{ exp.start }} — {{ exp.end }}</span>
                    </div>
                    <div class="timeline-sub text-mono">{{ exp.position }}</div>
                    <p class="timeline-desc text-serif">{{ exp.description }}</p>
                  </div>
                </div>
              </div>
              <div v-else class="section-empty text-mono">尚未添加工作经历</div>
            </div>

            <!-- 教育背景 -->
            <div class="resume-section">
              <h3 class="resume-section-title">
                <GraduationCapIcon class="icon-sm" /> 教育背景
              </h3>
              <div v-if="resume.education?.length" class="timeline">
                <div v-for="edu in resume.education" :key="edu.school" class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <span class="timeline-main text-display">{{ edu.school }}</span>
                      <span class="timeline-date text-mono">{{ edu.start }} — {{ edu.end }}</span>
                    </div>
                    <div class="timeline-sub text-mono">{{ edu.degree }} · {{ edu.major }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="section-empty text-mono">尚未添加教育背景</div>
            </div>

            <!-- 项目经历 -->
            <div class="resume-section" v-if="resume.projects?.length">
              <h3 class="resume-section-title">
                <RocketIcon class="icon-sm" /> 项目经历
              </h3>
              <div class="timeline">
                <div v-for="proj in resume.projects" :key="proj.name" class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <span class="timeline-main text-display">{{ proj.name }}</span>
                      <span class="timeline-date text-mono">{{ proj.start }} — {{ proj.end }}</span>
                    </div>
                    <div class="timeline-sub text-mono">{{ proj.role }}</div>
                    <p class="timeline-desc text-serif">{{ proj.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 技能 -->
            <div class="resume-section" v-if="resume.skills?.length">
              <h3 class="resume-section-title">
                <ZapIcon class="icon-sm" /> 专业技能
              </h3>
              <div class="skills-flex">
                <span v-for="skill in resume.skills" :key="skill" class="tag-pill">{{ skill }}</span>
              </div>
            </div>
          </div>

          <!-- 简历编辑器 -->
          <div class="resume-editor card animate-fade-in-up" style="animation-delay: 0.1s">
            <div class="editor-header">
              <div>
                <h3 class="text-subheading">编辑详细资料</h3>
                <p class="text-body-serif">手动完善您的简历信息，实时预览效果。</p>
              </div>
              <button class="btn btn-primary btn-sm" @click="saveManualResume" :disabled="saving" id="save-manual-resume-btn">
                <SaveIcon class="icon-xs" /> {{ saving ? '保存中...' : '保存更改' }}
              </button>
            </div>

            <!-- 编辑表单 -->
            <div class="editor-content">
              <div class="editor-section-group">
                <h4 class="editor-label text-mono">基本信息</h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label text-mono">姓名</label>
                    <input v-model="resume.basic_info.name" class="input" placeholder="姓名" />
                  </div>
                  <div class="form-group">
                    <label class="form-label text-mono">性别</label>
                    <div class="radio-group">
                      <label class="radio-item">
                        <input type="radio" value="男" v-model="resume.basic_info.gender" />
                        <span>男</span>
                      </label>
                      <label class="radio-item">
                        <input type="radio" value="女" v-model="resume.basic_info.gender" />
                        <span>女</span>
                      </label>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label text-mono">出生日期</label>
                    <input type="date" v-model="resume.basic_info.birthday" class="input" @change="calculateAge" />
                  </div>
                  <div class="form-group">
                    <label class="form-label text-mono">年龄（自动计算）</label>
                    <input v-model.number="resume.basic_info.age" type="number" class="input" placeholder="年龄" disabled />
                  </div>
                  <div class="form-group">
                    <label class="form-label text-mono">电话</label>
                    <input v-model="resume.basic_info.phone" class="input" placeholder="联系电话" />
                  </div>
                  <div class="form-group">
                    <label class="form-label text-mono">邮箱</label>
                    <input v-model="resume.basic_info.email" class="input" placeholder="电子邮箱" />
                  </div>
                  <div class="form-group">
                    <label class="form-label text-mono">所在城市</label>
                    <input v-model="resume.basic_info.city" class="input" placeholder="例如：北京" />
                  </div>
                  <div class="form-group">
                    <label class="form-label text-mono">GitHub 地址</label>
                    <input v-model="resume.basic_info.github" class="input" placeholder="https://github.com/username" />
                  </div>
                  <div class="form-group">
                    <label class="form-label text-mono">个人网站</label>
                    <input v-model="resume.basic_info.website" class="input" placeholder="https://your-website.com" />
                  </div>
                </div>
              </div>

              <!-- 工作经历编辑 -->
              <div class="editor-section-group">
                <div class="flex-between mb-4">
                  <h4 class="editor-label text-mono">工作经历</h4>
                  <button class="tag-pill" @click="addExperience" type="button">
                    <PlusIcon class="icon-xs" /> 添加
                  </button>
                </div>
                <div class="editor-stack">
                  <div v-for="(exp, index) in resume.experience" :key="`exp-${index}`" class="editor-item card">
                    <div class="form-grid mb-4">
                      <div class="form-group">
                        <label class="form-label text-mono">公司名称</label>
                        <input v-model="exp.company" class="input" placeholder="公司名称" />
                      </div>
                      <div class="form-group">
                        <label class="form-label text-mono">职位名称</label>
                        <input v-model="exp.position" class="input" placeholder="职位名称" />
                      </div>
                      <div class="form-group">
                        <label class="form-label text-mono">开始时间</label>
                        <input type="month" v-model="exp.start" class="input" />
                      </div>
                      <div class="form-group">
                        <label class="form-label text-mono">结束时间</label>
                        <div class="end-date-group">
                          <input v-if="!exp.current" type="month" v-model="exp.end" class="input flex-1" />
                          <input v-else type="text" value="至今" class="input flex-1" disabled />
                          <label class="checkbox-label">
                            <input type="checkbox" v-model="exp.current" @change="toggleCurrent(exp)" />
                            <span>至今</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div class="form-group mb-4">
                      <label class="form-label text-mono">职责描述</label>
                      <textarea v-model="exp.description" class="input text-serif" rows="4" placeholder="描述您的主要职责与取得的成就..."></textarea>
                    </div>
                    <button class="btn btn-ghost btn-sm text-danger" @click="removeExperience(index)" type="button">
                      <Trash2Icon class="icon-xs" /> 移除此项
                    </button>
                  </div>
                </div>
              </div>

              <!-- 教育经历编辑 -->
              <div class="editor-section-group">
                <div class="flex-between mb-4">
                  <h4 class="editor-label text-mono">教育背景</h4>
                  <button class="tag-pill" @click="addEducation" type="button">
                    <PlusIcon class="icon-xs" /> 添加
                  </button>
                </div>
                <div class="editor-stack">
                  <div v-for="(edu, index) in resume.education" :key="`edu-${index}`" class="editor-item card">
                    <div class="form-grid mb-4">
                      <div class="form-group">
                        <label class="form-label text-mono">学校名称</label>
                        <input v-model="edu.school" class="input" placeholder="例如：北京大学" />
                      </div>
                      <div class="form-group">
                        <label class="form-label text-mono">学历</label>
                        <select v-model="edu.degree" class="input">
                          <option value="">请选择学历</option>
                          <option value="大专">大专</option>
                          <option value="本科">本科</option>
                          <option value="硕士">硕士</option>
                          <option value="博士">博士</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label class="form-label text-mono">专业</label>
                        <input v-model="edu.major" class="input" placeholder="例如：计算机科学与技术" />
                      </div>
                      <div class="form-group">
                        <label class="form-label text-mono">开始时间</label>
                        <input type="month" v-model="edu.start" class="input" />
                      </div>
                      <div class="form-group">
                        <label class="form-label text-mono">结束时间</label>
                        <div class="end-date-group">
                          <input v-if="!edu.current" type="month" v-model="edu.end" class="input flex-1" />
                          <input v-else type="text" value="至今" class="input flex-1" disabled />
                          <label class="checkbox-label">
                            <input type="checkbox" v-model="edu.current" @change="toggleCurrent(edu)" />
                            <span>至今</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <button class="btn btn-ghost btn-sm text-danger" @click="removeEducation(index)" type="button">
                      <Trash2Icon class="icon-xs" /> 移除此项
                    </button>
                  </div>
                </div>
              </div>

              <!-- 项目经历编辑 -->
              <div class="editor-section-group">
                <div class="flex-between mb-4">
                  <h4 class="editor-label text-mono">项目经历</h4>
                  <button class="tag-pill" @click="addProject" type="button">
                    <PlusIcon class="icon-xs" /> 添加
                  </button>
                </div>
                <div class="editor-stack">
                  <div v-for="(proj, index) in resume.projects" :key="`proj-${index}`" class="editor-item card">
                    <div class="form-grid mb-4">
                      <div class="form-group">
                        <label class="form-label text-mono">项目名称</label>
                        <input v-model="proj.name" class="input" placeholder="项目名称" />
                      </div>
                      <div class="form-group">
                        <label class="form-label text-mono">你的角色</label>
                        <input v-model="proj.role" class="input" placeholder="例如：前端负责人" />
                      </div>
                      <div class="form-group">
                        <label class="form-label text-mono">开始时间</label>
                        <input type="month" v-model="proj.start" class="input" />
                      </div>
                      <div class="form-group">
                        <label class="form-label text-mono">结束时间</label>
                        <div class="end-date-group">
                          <input v-if="!proj.current" type="month" v-model="proj.end" class="input flex-1" />
                          <input v-else type="text" value="至今" class="input flex-1" disabled />
                          <label class="checkbox-label">
                            <input type="checkbox" v-model="proj.current" @change="toggleCurrent(proj)" />
                            <span>至今</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div class="form-group mb-4">
                      <label class="form-label text-mono">项目描述</label>
                      <textarea v-model="proj.description" class="input text-serif" rows="4" placeholder="描述项目内容和你的贡献..."></textarea>
                    </div>
                    <button class="btn btn-ghost btn-sm text-danger" @click="removeProject(index)" type="button">
                      <Trash2Icon class="icon-xs" /> 移除此项
                    </button>
                  </div>
                </div>
              </div>

              <!-- 技能与证书 -->
              <div class="editor-section-group">
                <div class="flex-between mb-4">
                  <h4 class="editor-label text-mono">技能与证书</h4>
                </div>
                <div class="form-group mb-4">
                  <label class="form-label text-mono">期望职位</label>
                  <input v-model="resume.title" class="input" placeholder="例如：前端开发工程师" />
                </div>
                <div class="form-group mb-4">
                  <label class="form-label text-mono">专业技能</label>
                  <input v-model="skillsInput" class="input" placeholder="多个技能请用逗号分隔" @input="parseSkillsInput" />
                  <div v-if="parsedSkills.length > 0" class="skills-preview">
                    <span v-for="skill in parsedSkills" :key="skill" class="skill-tag">{{ skill }}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label text-mono">获得证书</label>
                  <input v-model="certificatesInput" class="input" placeholder="多个证书请用逗号分隔" />
                </div>
              </div>

              <!-- 自我评价 -->
              <div class="editor-section-group">
                <h4 class="editor-label text-mono">自我评价</h4>
                <div class="form-group">
                  <textarea v-model="resume.self_evaluation" class="input text-serif" rows="5" placeholder="总结您的职业核心优势..."></textarea>
                </div>
              </div>

              <!-- 底部保存按钮 -->
              <div class="editor-footer">
                <button class="btn btn-primary btn-lg" @click="saveManualResume" :disabled="saving">
                  <SaveIcon class="icon-sm mr-2" /> {{ saving ? '保存中...' : '保存简历' }}
                </button>
                <span v-if="hasUnsavedChanges" class="unsaved-hint text-mono text-tertiary ml-3">
                  有未保存的更改
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 侧边栏 -->
        <aside class="resume-sidebar">
          <!-- AI 评分 -->
          <div class="score-card card animate-fade-in-up" style="animation-delay: 0.2s">
            <h3 class="text-mono text-center mb-6">简历评分</h3>
            <div class="score-ring">
              <svg viewBox="0 0 100 100" class="score-svg">
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border)" stroke-width="2" />
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="var(--color-primary)"
                  stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="`${aiScore * 2.82} 282`"
                  stroke-dashoffset="0"
                  transform="rotate(-90 50 50)"
                  class="score-circle-anim"
                />
              </svg>
              <div class="score-content">
                <div class="score-number text-display">{{ aiScore }}</div>
                <div class="score-unit text-mono">/ 100</div>
              </div>
            </div>
            <p class="text-body-serif text-center mt-4">
              {{ aiScore < 80 ? '您的简历仍有优化空间，建议使用 AI 深度优化以提升竞争力。' : '简历质量优秀，已超越 90% 的同类竞争者！' }}
            </p>
          </div>

          <!-- 完整度 -->
          <div class="completeness-card card animate-fade-in-up" style="animation-delay: 0.3s">
            <h3 class="text-mono mb-4">完成度</h3>
            <div class="progress-wrapper">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: completeness + '%' }"></div>
              </div>
              <span class="progress-text text-mono">{{ completeness }}%</span>
            </div>
            <div class="completeness-list">
              <div v-for="item in completenessItems" :key="item.label" class="comp-item" :class="{ done: item.done }">
                <CheckCircleIcon v-if="item.done" class="icon-xs text-success" />
                <CircleIcon v-else class="icon-xs text-tertiary" />
                <span class="text-mono">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  createDefaultResume,
  fetchUserResume,
  saveResume,
} from '@/lib/database'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { Resume, ResumeEducation, ResumeExperience, ResumeProject } from '@/types'
import AppAvatar from '@/components/AppAvatar.vue'
import {
  Zap as ZapIcon,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  User as UserIcon,
  Briefcase as BriefcaseIcon,
  GraduationCap as GraduationCapIcon,
  Rocket as RocketIcon,
  Save as SaveIcon,
  Plus as PlusIcon,
  Trash2 as Trash2Icon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  Github as GithubIcon,
  Globe as GlobeIcon,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const toast = useToast()
const resume = ref<Resume>({
  id: '',
  user_id: '',
  title: '我的简历',
  file_url: '',
  basic_info: {
    name: '',
    gender: '',
    age: 0,
    birthday: '',
    phone: '',
    email: '',
    city: '',
    github: '',
    website: '',
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certificates: [],
  self_evaluation: '',
  ai_optimized_content: '',
  ai_score: 0,
  ai_suggestions: [],
  is_default: true,
  created_at: '',
  updated_at: '',
})
const loading = ref(false)
const saving = ref(false)
const skillsInput = ref('')
const certificatesInput = ref('')
const aiScore = computed(() => resume.value.ai_score || 0)

// Parse skills for preview
const parsedSkills = computed(() => {
  return parseListInput(skillsInput.value)
})

// Track if there are unsaved changes
const originalResume = ref<string>('')
const hasUnsavedChanges = computed(() => {
  return originalResume.value !== JSON.stringify(resume.value)
})

const completeness = computed(() => {
  let total = 0
  if (resume.value.basic_info.name) total += 15
  if (resume.value.experience?.length) total += 25
  if (resume.value.education?.length) total += 20
  if (resume.value.skills?.length) total += 15
  if (resume.value.self_evaluation) total += 10
  if (resume.value.projects?.length) total += 10
  if (resume.value.certificates?.length) total += 5
  return total
})

const completenessItems = computed(() => [
  { label: '基本信息', done: !!resume.value.basic_info.name },
  { label: '工作经历', done: !!resume.value.experience?.length },
  { label: '教育背景', done: !!resume.value.education?.length },
  { label: '专业技能', done: !!resume.value.skills?.length },
  { label: '自我评价', done: !!resume.value.self_evaluation },
  { label: '项目经历', done: !!resume.value.projects?.length },
  { label: '获得证书', done: !!resume.value.certificates?.length },
])

watch(
  () => resume.value.skills,
  (skills) => {
    skillsInput.value = (skills || []).join(', ')
  },
  { immediate: true, deep: true },
)

watch(
  () => resume.value.certificates,
  (certificates) => {
    certificatesInput.value = (certificates || []).join(', ')
  },
  { immediate: true, deep: true },
)

function parseListInput(value: string) {
  return value
    .split(/[,\uff0c\n]/)
    .map(item => item.trim())
    .filter(Boolean)
}

// Extend with current flag for UI
type ExperienceWithCurrent = ResumeExperience & { current?: boolean }
type EducationWithCurrent = ResumeEducation & { current?: boolean }
type ProjectWithCurrent = ResumeProject & { current?: boolean }

function toggleCurrent(item: { current?: boolean; end: string }) {
  if (item.current) {
    item.end = '至今'
  } else {
    item.end = ''
  }
}

// Calculate age from birthday
function calculateAge() {
  const birthday = resume.value.basic_info.birthday
  if (!birthday) {
    resume.value.basic_info.age = 0
    return
  }
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  resume.value.basic_info.age = age
}

async function ensureResumeLoaded() {
  if (!authStore.user) return

  loading.value = true
  try {
    const existing = await fetchUserResume(authStore.user.id)
    if (existing) {
      // Ensure new fields exist on older resumes
      if (!existing.basic_info.github) existing.basic_info.github = ''
      if (!existing.basic_info.website) existing.basic_info.website = ''
      if (!('birthday' in existing.basic_info)) existing.basic_info.birthday = ''
      resume.value = existing
      // Add current flag for items that end with "至今"
      ;(resume.value.experience as ExperienceWithCurrent[]).forEach(exp => {
        exp.current = exp.end === '至今'
      })
      ;(resume.value.education as EducationWithCurrent[]).forEach(edu => {
        edu.current = edu.end === '至今'
      })
      ;(resume.value.projects as ProjectWithCurrent[]).forEach(proj => {
        proj.current = proj.end === '至今'
      })
      originalResume.value = JSON.stringify(resume.value)
    } else {
      resume.value = await createDefaultResume(authStore.user)
      originalResume.value = JSON.stringify(resume.value)
    }
  } catch (error: any) {
    toast.error(`加载简历失败：${error?.message || '请稍后重试'}`)
  } finally {
    loading.value = false
  }
}

function addExperience() {
  (resume.value.experience as ExperienceWithCurrent[]).push({
    company: '',
    position: '',
    start: '',
    end: '',
    description: '',
    current: false,
  })
}

function removeExperience(index: number) {
  resume.value.experience.splice(index, 1)
}

function addEducation() {
  (resume.value.education as EducationWithCurrent[]).push({
    school: '',
    degree: '',
    major: '',
    start: '',
    end: '',
    current: false,
  })
}

function removeEducation(index: number) {
  resume.value.education.splice(index, 1)
}

function addProject() {
  (resume.value.projects as ProjectWithCurrent[]).push({
    name: '',
    role: '',
    description: '',
    start: '',
    end: '',
    current: false,
  })
}

function removeProject(index: number) {
  resume.value.projects.splice(index, 1)
}

function parseSkillsInput() {
  // Trigger reactivity update for preview
  void parsedSkills.value
}

async function saveManualResume() {
  if (!authStore.user) return

  saving.value = true
  try {
    // Parse skills and certificates
    resume.value.skills = parseListInput(skillsInput.value)
    resume.value.certificates = parseListInput(certificatesInput.value)

    // Clone and strip the current flag before saving to database
    const cleanResume = JSON.parse(JSON.stringify(resume.value))
    ;(cleanResume.experience as ExperienceWithCurrent[]).forEach(exp => {
      delete exp.current
    })
    ;(cleanResume.education as EducationWithCurrent[]).forEach(edu => {
      delete edu.current
    })
    ;(cleanResume.projects as ProjectWithCurrent[]).forEach(proj => {
      delete proj.current
    })

    resume.value = await saveResume(authStore.user.id, cleanResume)
    originalResume.value = JSON.stringify(resume.value)
    toast.success('简历已成功保存')
  } catch (error: any) {
    toast.error(`保存失败：${error?.message || '请稍后重试'}`)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  ensureResumeLoaded()
})
</script>

<style scoped>
.resume-page {
  padding: 60px 0 100px;
  background-color: var(--color-bg-canvas);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
  background: var(--color-bg-surface-200);
}

.resume-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 40px;
  align-items: flex-start;
}

.resume-main {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 预览部分 */
.resume-preview {
  padding: 48px;
  background-color: var(--color-bg-surface-100); /* Lighter surface for document feel */
}

.resume-section {
  padding: 32px 0;
  border-top: 1px solid var(--color-border);
}

.resume-section.no-border {
  border-top: none;
  padding-top: 0;
}

.resume-header-info {
  display: flex;
  align-items: center;
  gap: 32px;
}

.resume-basic {
  flex: 1;
}

.resume-meta-row, .resume-contact-row {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 12px;
}

.resume-contact-row .link {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s;
}

.resume-contact-row .link:hover {
  color: #cf2d56;
  text-decoration: underline;
}

.resume-section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 24px;
}

.section-content {
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text-primary);
}

/* 时间线 */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.timeline-item {
  position: relative;
  padding-left: 24px;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 2.5px;
  top: 24px;
  bottom: -32px;
  width: 1px;
  background: var(--color-border);
}

.timeline-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.timeline-main {
  font-size: 18px;
  color: var(--color-text-primary);
}

.timeline-date {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.timeline-sub {
  font-size: 13px;
  color: var(--color-primary);
  margin-bottom: 12px;
}

.timeline-desc {
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.skills-flex {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 编辑器部分 */
.resume-editor {
  padding: 40px;
  background-color: var(--color-bg-surface-200);
}

.editor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--color-border);
}

.editor-section-group {
  margin-bottom: 48px;
}

.editor-section-group:last-child {
  margin-bottom: 0;
}

.editor-label {
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.editor-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.editor-item {
  padding: 24px;
  background: var(--color-bg-surface-300);
}

.editor-footer {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
}

.unsaved-hint {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 24px;
  padding-top: 8px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-primary);
}

.radio-item input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

/* Checkbox Label */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

/* End Date Group with checkbox */
.end-date-group {
  display: flex;
  align-items: end;
  gap: 12px;
}

.end-date-group .flex-1 {
  flex: 1;
}

/* Skills Preview */
.skills-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.skills-preview .skill-tag {
  font-size: 11px;
  padding: 2px 8px;
  background-color: rgba(245, 78, 0, 0.1);
  color: #f54e00;
  border-radius: var(--radius-pill);
}

/* 侧边栏 */
.resume-sidebar {
  position: sticky;
  top: 108px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.score-card, .completeness-card {
  padding: 32px 24px;
  background-color: var(--color-bg-surface-200);
}

.score-ring {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto;
}

.score-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-number {
  font-size: 48px;
  color: var(--color-text-primary);
  line-height: 1;
}

.score-unit {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.score-circle-anim {
  transition: stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--color-bg-surface-400);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-text {
  font-size: 13px;
  color: var(--color-text-primary);
}

.completeness-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comp-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.comp-item.done {
  color: var(--color-text-primary);
}

.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-center { display: flex; align-items: center; }
.flex-1 { flex: 1; }
.mr-1 { margin-right: 4px; }
.mr-2 { margin-right: 8px; }
.mr-3 { margin-right: 12px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.ml-3 { margin-left: 12px; }
.text-success { color: var(--color-success); }
.text-tertiary { color: var(--color-text-tertiary); }
.text-danger { color: var(--color-error); }

@media (max-width: 1024px) {
  .resume-layout {
    grid-template-columns: 1fr;
  }
  .resume-sidebar {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 834px) {
  .resume-sidebar {
    grid-template-columns: 1fr;
  }
  .resume-preview, .resume-editor {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .header-actions { width: 100%; }
  .header-actions .btn { width: 100%; }
}
</style>
