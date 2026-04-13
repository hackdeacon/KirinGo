<template>
  <div class="profile-page">
    <div class="container-cursor">
      <div class="profile-layout">
        <!-- 侧边栏：个人概览 -->
        <aside class="profile-sidebar">
          <div class="sidebar-card card">
            <div class="profile-hero">
              <button class="avatar-upload-trigger" @click="triggerAvatarUpload" id="upload-avatar-trigger" :disabled="avatarUploading">
                <AppAvatar class="profile-avatar" :src="editForm.avatar_url || user?.avatar_url" :alt="user?.full_name || '用户头像'" size="xl" />
                <div class="avatar-overlay" :class="{ 'is-uploading': avatarUploading }">
                  <div v-if="avatarUploading" class="loader-mini"></div>
                  <CameraIcon v-else class="icon-sm" />
                </div>
              </button>
              <h1 class="profile-name">{{ user?.full_name || '用户' }}</h1>
              <p class="profile-email text-mono">{{ user?.email }}</p>
              <div class="role-badge-wrapper">
                <span class="role-tag" :class="user?.role">
                  {{ user?.role === 'recruiter' ? '招聘方' : '求职者' }}
                </span>
              </div>
            </div>

            <div class="profile-stats">
              <div v-for="stat in stats" :key="stat.label" class="stat-box">
                <span class="stat-value text-mono">{{ stat.value }}</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
            </div>

            <nav class="profile-nav">
              <router-link v-for="entry in quickEntries" :key="entry.path" :to="entry.path" class="nav-item" active-class="active">
                <component :is="entry.icon" class="nav-icon" />
                <span class="nav-label">{{ entry.label }}</span>
                <span v-if="entry.count" class="nav-badge text-mono">{{ entry.count }}</span>
              </router-link>
            </nav>

            <div class="sidebar-footer">
              <button class="btn btn-ghost btn-block logout-btn" @click="handleLogout">
                <LogOutIcon class="icon-sm" /> 退出登录
              </button>
            </div>
          </div>
        </aside>

        <!-- 主内容区：详细资料 & 设置 -->
        <main class="profile-main">
          <!-- 个人资料编辑区 -->
          <section class="profile-section card animate-fade-in-up">
            <div class="section-header">
              <h2 class="text-subheading">基本信息</h2>
              <button class="btn btn-primary btn-sm" @click="saveProfile" :disabled="!isFormDirty" id="save-profile-btn">
                <SaveIcon class="icon-xs" /> 保存更改
              </button>
            </div>
            
            <div class="profile-form">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label text-mono">姓名</label>
                  <input v-model="editForm.full_name" class="input" placeholder="输入您的真实姓名" id="edit-name" />
                </div>
                <div class="form-group">
                  <label class="form-label text-mono">城市</label>
                  <input v-model="editForm.city" class="input" placeholder="当前所在地" id="edit-city" />
                </div>
                <div class="form-group full-width">
                  <label class="form-label text-mono">个人简介</label>
                  <textarea v-model="editForm.bio" class="input text-serif" placeholder="简单介绍一下自己..." rows="4" id="edit-bio"></textarea>
                </div>
              </div>
            </div>
          </section>

          <!-- 系统设置区 -->
          <section class="profile-section card animate-fade-in-up" style="animation-delay: 0.1s">
            <h2 class="text-subheading mb-6">系统设置</h2>
            <div class="settings-grid">
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-title">主题外观</div>
                  <div class="setting-desc">选择颜色模式，自动跟随系统设置</div>
                </div>
                <div class="theme-selector">
                  <button
                    v-for="option in themeOptions"
                    :key="option.value"
                    class="theme-pill"
                    :class="{ active: themeStore.mode === option.value }"
                    @click="themeStore.setMode(option.value as any)"
                  >
                    <component :is="option.icon" class="theme-icon" />
                    <span>{{ option.label }}</span>
                  </button>
                </div>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-title">消息通知</div>
                  <div class="setting-desc">接收关于职位投递和面试邀请的实时通知</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" checked />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-title">隐私保护</div>
                  <div class="setting-desc">向未投递的企业隐藏我的在线状态</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-title">关于 麒麟智聘</div>
                  <div class="setting-desc">当前版本 v1.0.0 (Cursor Warm Minimalist)</div>
                </div>
                <InfoIcon class="icon-sm text-secondary" />
              </div>
            </div>
          </section>
        </main>
      </div>

      <!-- 头像上传 Input (隐藏) -->
      <input
        ref="avatarInput"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style="display:none"
        @change="handleAvatarChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchProfileStats, uploadAvatarFile } from '@/lib/database'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useToast } from '@/composables/useToast'
import AppAvatar from '@/components/AppAvatar.vue'
import {
  Camera as CameraIcon,
  LogOut as LogOutIcon,
  Save as SaveIcon,
  FileText as FileTextIcon,
  Zap as ZapIcon,
  Mic as MicIcon,
  ClipboardList as ClipboardListIcon,
  MessageSquare as MessageSquareIcon,
  Layout as LayoutIcon,
  Briefcase as BriefcaseIcon,
  PlusCircle as PlusIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Monitor as MonitorIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const toast = useToast()

const user = computed(() => authStore.user)
const isRecruiter = computed(() => authStore.isRecruiter)
const avatarInput = ref<HTMLInputElement>()
const avatarUploading = ref(false)
const stats = ref<Array<{ label: string; value: string }>>([])
const quickEntryCounts = ref({
  applications: 0,
  conversations: 0,
  jobs: 0,
  interviews: 0,
})

const editForm = reactive({
  full_name: user.value?.full_name || '',
  avatar_url: user.value?.avatar_url || '',
  city: user.value?.city || '',
  bio: user.value?.bio || '',
})

// 检查表单是否被修改
const isFormDirty = computed(() => {
  if (!user.value) return false
  return editForm.full_name !== (user.value.full_name || '') ||
         editForm.city !== (user.value.city || '') ||
         editForm.bio !== (user.value.bio || '')
})

const quickEntries = computed(() => {
  if (isRecruiter.value) {
    return [
      { icon: BriefcaseIcon, label: '职位管理', path: '/recruiter/jobs', count: quickEntryCounts.value.jobs },
      { icon: PlusIcon, label: '发布职位', path: '/recruiter/jobs/post' },
      { icon: ClipboardListIcon, label: '人才管理', path: '/applications', count: quickEntryCounts.value.applications },
      { icon: MessageSquareIcon, label: '即时沟通', path: '/chat', count: quickEntryCounts.value.conversations },
      { icon: SettingsIcon, label: '公司设置', path: '/recruiter/company/settings' },
    ]
  }

  return [
    { icon: FileTextIcon, label: '我的简历', path: '/resume' },
    { icon: ZapIcon, label: '简历优化', path: '/resume/ai-optimize' },
    { icon: MicIcon, label: '模拟面试', path: '/interview', count: quickEntryCounts.value.interviews },
    { icon: ClipboardListIcon, label: '投递记录', path: '/applications', count: quickEntryCounts.value.applications },
    { icon: MessageSquareIcon, label: '消息通知', path: '/chat', count: quickEntryCounts.value.conversations },
  ]
})

watch(user, async (profile) => {
  if (!profile) return

  editForm.full_name = profile.full_name || ''
  editForm.avatar_url = profile.avatar_url || ''
  editForm.city = profile.city || ''
  editForm.bio = profile.bio || ''

  try {
    const profileStats = await fetchProfileStats(profile.id, profile.role)
    stats.value = profileStats.summaryCards
    quickEntryCounts.value = profileStats.quickEntryCounts
  } catch (error: any) {
    toast.error(`加载个人数据失败：${error?.message || '请稍后重试'}`)
  }
}, { immediate: true })

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

async function handleAvatarChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !user.value) return

  avatarUploading.value = true
  try {
    const avatarUrl = await uploadAvatarFile(user.value.id, file)
    editForm.avatar_url = avatarUrl
    await authStore.updateProfile({ avatar_url: avatarUrl })
    toast.success('头像已更新')
  } catch (error: any) {
    toast.error(`头像上传失败：${error?.message || '请稍后重试'}`)
  } finally {
    avatarUploading.value = false
    if (avatarInput.value) {
      avatarInput.value.value = ''
    }
  }
}

async function saveProfile() {
  try {
    await authStore.updateProfile({
      full_name: editForm.full_name,
      city: editForm.city,
      bio: editForm.bio
    })
    toast.success('个人资料已更新')
  } catch (error: any) {
    toast.error(`保存失败：${error?.message || '请检查网络'}`)
  }
}

const themeOptions = [
  { value: 'light', label: '浅色', icon: SunIcon },
  { value: 'dark', label: '深色', icon: MoonIcon },
  { value: 'auto', label: '自动', icon: MonitorIcon },
]

async function handleLogout() {
  await authStore.signOut()
  toast.info('已退出登录')
  router.push('/auth/login')
}
</script>

<style scoped>
.profile-page {
  padding: 60px 0 100px;
  background-color: var(--color-bg-canvas);
  min-height: calc(100vh - 48px);
}

.profile-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 40px;
  align-items: flex-start;
}

/* 侧边栏样式 */
.profile-sidebar {
  position: sticky;
  top: 108px;
}

.sidebar-card {
  padding: 32px 24px;
  background-color: var(--color-bg-surface-200);
}

.profile-hero {
  text-align: center;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 24px;
}

.avatar-upload-trigger {
  position: relative;
  margin: 0 auto 20px;
  display: block;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(38, 37, 30, 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-upload-trigger:hover .avatar-overlay,
.avatar-overlay.is-uploading {
  opacity: 1;
}

.loader-mini {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.profile-name {
  font-family: var(--font-display);
  font-size: 22px;
  letter-spacing: var(--tracking-title-sm);
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.profile-email {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.role-tag {
  display: inline-block;
  padding: 4px 12px;
  font-family: var(--font-display);
  font-size: 11px;
  border-radius: var(--radius-pill);
  background: var(--color-bg-surface-400);
  color: var(--color-text-secondary);
}

.role-tag.recruiter {
  background: rgba(192, 133, 50, 0.1);
  color: #c08532;
}

.role-tag.jobseeker {
  background: rgba(245, 78, 0, 0.1);
  color: var(--color-primary);
}

.profile-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.stat-box {
  padding: 16px;
  background: var(--color-bg-surface-300);
  border-radius: var(--radius-md);
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.stat-label {
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
}

.profile-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 32px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  text-decoration: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: all 0.15s ease;
}

.nav-item:hover {
  background: var(--color-bg-surface-300);
  color: var(--color-text-primary);
}

.nav-icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
}

.nav-label {
  flex: 1;
  font-family: var(--font-display);
  font-size: 14px;
}

.nav-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: var(--color-bg-surface-400);
  border-radius: var(--radius-pill);
}

.sidebar-footer {
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

/* 主内容区样式 */
.profile-main {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.profile-section {
  padding: 40px;
  background-color: var(--color-bg-surface-200);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  letter-spacing: 0.05em;
}

.settings-grid {
  display: flex;
  flex-direction: column;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid var(--color-border);
}

.setting-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-row:first-child {
  padding-top: 0;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-family: var(--font-display);
  font-size: 16px;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* Toggle 样式复用并微调 */
.toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}

.toggle input { opacity: 0; width: 0; height: 0; }

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--color-bg-surface-400);
  border-radius: 22px;
  transition: 0.2s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background: var(--color-text-inverse);
  border-radius: 50%;
  transition: 0.2s;
}

.toggle input:checked + .toggle-slider {
  background: var(--color-primary);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.icon-xs { width: 14px; height: 14px; }
.icon-sm { width: 16px; height: 16px; }
.mb-6 { margin-bottom: 24px; }

/* Theme selector */
.theme-selector {
  display: flex;
  gap: 4px;
  background: var(--color-bg-surface-300);
  border-radius: var(--radius-pill);
  padding: 3px;
}

.theme-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--radius-pill);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-display);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-pill:hover {
  color: var(--color-text-primary);
}

.theme-pill.active {
  background: var(--color-bg-canvas);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
}

.theme-icon {
  width: 14px;
  height: 14px;
}

@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
  .profile-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 40px 0 100px;
  }
  .profile-section {
    padding: 24px;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
}
</style>
