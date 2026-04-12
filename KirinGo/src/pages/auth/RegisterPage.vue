<template>
  <div class="auth-page">
    <div class="auth-container animate-fade-in-up">
      <!-- 左侧装饰 - Dark Stats Mode -->
      <div class="auth-hero">
        <div class="hero-content">
          <div class="hero-badge text-mono animate-fade-in">
            <div class="badge-dot-live"></div>
            <span>NETWORK EXPANSION</span>
          </div>
          <h1 class="hero-title text-display">Join the KirinGo community.</h1>
          <p class="hero-subtitle text-serif">开启由 AI 驱动的智能求职之旅，与全球顶尖企业建立深层连接。</p>
          
          <div class="hero-stats-v2">
            <div v-for="(stat, i) in stats" :key="stat.label" class="stat-item-v2 animate-fade-in-up" :style="{ animationDelay: `${i * 0.1 + 0.3}s` }">
              <div class="stat-value-v2 text-mono">{{ stat.value }}</div>
              <div class="stat-label-v2 text-mono">{{ stat.label }}</div>
              <div class="stat-bar-v2" :style="{ backgroundColor: stat.color }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单 -->
      <div class="auth-form-wrapper">
        <div class="auth-form">
          <template v-if="!isRegistered">
            <div class="form-header-v2">
              <div class="section-tag text-mono">REGISTRATION</div>
              <h2 class="text-heading mt-2">创建您的账号</h2>
              <p class="text-body-serif mt-2">选择您的角色，开始体验 AI 招聘。 </p>
            </div>

            <!-- 角色选择 - Pill Style -->
            <div class="role-selector-v2 mt-8">
              <button
                class="role-pill"
                :class="{ active: role === 'jobseeker' }"
                @click="role = 'jobseeker'"
              >
                <UserIcon class="icon-xs mr-2" /> 求职者
              </button>
              <button
                class="role-pill"
                :class="{ active: role === 'recruiter' }"
                @click="role = 'recruiter'"
              >
                <BuildingIcon class="icon-xs mr-2" /> 招聘者
              </button>
            </div>

            <form @submit.prevent="handleRegister" class="mt-8">
              <div class="form-group-v2">
                <label class="label-v2 text-mono">FULL NAME</label>
                <div class="input-wrapper-v2">
                  <UserIcon class="input-icon-v2" />
                  <input
                    v-model="fullName"
                    type="text"
                    class="input-v2"
                    placeholder="您的真实姓名"
                    required
                  />
                </div>
              </div>

              <div class="form-group-v2">
                <label class="label-v2 text-mono">EMAIL ADDRESS</label>
                <div class="input-wrapper-v2">
                  <MailIcon class="input-icon-v2" />
                  <input
                    v-model="email"
                    type="email"
                    class="input-v2"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div class="form-group-v2">
                <label class="label-v2 text-mono">PASSWORD</label>
                <div class="input-wrapper-v2">
                  <LockIcon class="input-icon-v2" />
                  <input
                    v-model="password"
                    type="password"
                    class="input-v2"
                    placeholder="至少 6 位字符"
                    required
                    minlength="6"
                  />
                </div>
              </div>

              <button
                type="submit"
                class="btn-auth-submit btn-block mt-8"
                :disabled="loading"
              >
                <span v-if="loading" class="loading-spinner-v2"></span>
                <span v-else class="flex-center">立即注册 <ArrowRightIcon class="icon-xs ml-2" /></span>
              </button>
            </form>

            <div class="form-footer-v2 text-serif">
              已有账号？
              <router-link to="/auth/login" class="link-v2">登录现有账号</router-link>
            </div>
          </template>

          <template v-else>
            <div class="success-state-v2 animate-fade-in-up">
              <div class="success-icon-box">
                <MailIcon class="icon-xl" />
              </div>
              <h2 class="text-heading mb-4">验证您的邮箱</h2>
              <p class="text-body-serif mb-8">我们已向 <strong>{{ email }}</strong> 发送了一封验证邮件，请点击邮件中的链接完成验证后再登录。</p>
              
              <div class="success-actions-v2">
                <router-link to="/auth/login" class="btn-auth-submit">前往登录</router-link>
                <button class="reset-link-v2 text-mono" @click="isRegistered = false">返回修改邮箱</button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { UserRole } from '@/types'
import { 
  User as UserIcon, 
  Building as BuildingIcon, 
  Mail as MailIcon, 
  Lock as LockIcon, 
  ArrowRight as ArrowRightIcon 
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const fullName = ref('')
const email = ref('')
const password = ref('')
const role = ref<UserRole>('jobseeker')
const isRegistered = ref(false)
const loading = ref(false)

const stats = [
  { value: '100k+', label: 'JOBS', color: '#dfa88f' },
  { value: '50k+', label: 'COMPANIES', color: '#9fc9a2' },
  { value: '98%', label: 'AI MATCH', color: '#c0a8dd' }
]

async function handleRegister() {
  if (!fullName.value || !email.value || !password.value) {
    toast.warning('请填写所有必填项')
    return
  }

  if (password.value.length < 6) {
    toast.warning('密码至少6位')
    return
  }

  loading.value = true
  try {
    const { error } = await authStore.signUp(email.value, password.value, fullName.value, role.value)
    if (error) {
      toast.error('注册失败：' + (error as any).message)
      return
    }
    isRegistered.value = true
    toast.success('注册成功！请检查您的邮箱进行验证')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-canvas);
  padding: 24px;
  overflow-x: hidden;
  /* Don't clip shadow - allow container shadow to show outside */
}

.auth-container {
  display: flex;
  width: 100%;
  max-width: 1100px;
  max-height: 680px;
  background-color: var(--color-bg-surface-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-cursor-elevated);
  border: 1px solid var(--color-border);
  overflow: hidden; /* Clip inner content */
}

/* Hero Section (Dark Side) */
.auth-hero {
  flex: 1.1;
  background-color: #000000;
  color: #ffffff;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.auth-hero::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 20% 30%, rgba(245, 78, 0, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(192, 168, 221, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-pill);
  font-size: 10px;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 20px;
}

.badge-dot-live {
  width: 6px;
  height: 6px;
  background-color: var(--color-primary);
  border-radius: 50%;
  position: relative;
}

.badge-dot-live::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 1px solid var(--color-primary);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
}

.hero-title {
  font-size: 34px;
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 36px;
}

.hero-stats-v2 {
  display: flex;
  gap: 24px;
}

.stat-item-v2 {
  position: relative;
  padding-bottom: 12px;
}

.stat-value-v2 {
  font-size: 24px;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label-v2 {
  font-size: 9px;
  letter-spacing: 0.1em;
  opacity: 0.4;
}

.stat-bar-v2 {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 16px;
  height: 2px;
  border-radius: 1px;
}

/* Form Section (Warm Light) */
.auth-form-wrapper {
  flex: 1;
  padding: 48px;
  background-color: var(--color-bg-canvas);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

.auth-form {
  width: 100%;
  max-width: 360px;
}

.section-tag {
  font-size: 10px;
  letter-spacing: 0.15em;
  color: var(--color-text-tertiary);
}

.role-selector-v2 {
  display: flex;
  gap: 10px;
}

.role-pill {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-surface-300);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.role-pill:hover {
  background: var(--color-bg-surface-400);
  color: var(--color-text-primary);
}

.role-pill.active {
  background: var(--color-text-primary);
  color: var(--color-bg-canvas);
  border-color: var(--color-text-primary);
}

.form-group-v2 {
  margin-bottom: 20px;
}

.label-v2 {
  display: block;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
  margin-bottom: 8px;
}

.input-wrapper-v2 {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-v2 {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: var(--color-text-tertiary);
}

.input-v2 {
  width: 100%;
  height: 44px;
  padding: 0 14px 0 44px;
  background: var(--color-bg-surface-100);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-size: 15px;
  transition: all 0.2s;
  outline: none;
}

.input-v2:focus {
  border-color: var(--color-border-medium);
  background: var(--color-bg-surface-200);
  box-shadow: var(--shadow-focus);
}

.btn-auth-submit {
  width: 100%;
  height: 48px;
  background: var(--color-text-primary);
  color: var(--color-bg-canvas);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn-auth-submit:hover:not(:disabled) {
  background: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-auth-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.loading-spinner-v2 {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.form-footer-v2 {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.link-v2 {
  color: var(--color-text-primary);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 4px;
  margin-left: 4px;
}

.link-v2:hover {
  color: var(--color-primary);
}

.success-state-v2 {
  text-align: center;
  padding: 0;
}

.success-icon-box {
  width: 56px;
  height: 56px;
  background: var(--color-bg-surface-300);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: var(--color-primary);
}

.success-actions-v2 {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
}

.reset-link-v2 {
  background: none;
  border: none;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color 0.2s;
}

.reset-link-v2:hover {
  color: var(--color-text-primary);
}

.icon-xs {
  width: 16px;
  height: 16px;
}

.flex-center { display: flex; align-items: center; }
.ml-2 { margin-left: 8px; }
.mr-2 { margin-right: 8px; }
.mt-2 { margin-top: 8px; }
.mt-8 { margin-top: 24px; }
.mb-4 { margin-bottom: 12px; }
.mb-8 { margin-bottom: 24px; }

@media (max-width: 1024px) {
  .auth-hero { display: none; }
  .auth-container { max-width: 500px; max-height: 580px; }
  .auth-form-wrapper { padding: 32px 40px; }
}

@media (max-width: 768px) {
  .auth-page { padding: 16px 16px 32px 16px; min-height: 100vh; overflow-y: auto; align-items: flex-start; }
  .auth-container { border: none; box-shadow: none; background: transparent; height: auto; max-height: none; }
  .auth-form-wrapper { padding: 24px 0; background: transparent; overflow: visible; }
}

@media (max-width: 320px) {
  .auth-page { padding: 12px 12px 24px 12px; }
  .auth-form-wrapper { padding: 16px 0; }
}
</style>
