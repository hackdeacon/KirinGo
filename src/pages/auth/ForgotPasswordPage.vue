<template>
  <div class="auth-page">
    <div class="auth-container animate-fade-in-up">
      <!-- 左侧装饰 -->
      <div class="auth-hero">
        <div class="hero-content">
          <div class="hero-badge text-mono animate-fade-in">
            <div class="badge-dot-live"></div>
            <span>PASSWORD RECOVERY</span>
          </div>
          <h1 class="hero-title text-display">Secure your account with KirinGo.</h1>
          <p class="hero-subtitle text-serif">请输入您的注册邮箱，我们将向您发送重置密码的链接。</p>

          <div class="hero-features-v2">
            <div v-for="(feat, i) in features" :key="feat.label" class="feature-card-v2 animate-fade-in-up" :style="{ animationDelay: `${i * 0.1 + 0.3}s` }">
              <div class="feature-icon-v2" :style="{ color: feat.color }">
                <component :is="feat.icon" class="icon-sm" />
              </div>
              <div class="feature-info-v2">
                <div class="feature-label-v2 text-mono">{{ feat.label }}</div>
                <div class="feature-desc-v2 text-serif">{{ feat.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单 -->
      <div class="auth-form-wrapper">
        <div class="auth-form">
          <div class="form-header-v2">
            <div class="section-tag text-mono">RECOVERY</div>
            <h2 class="text-heading mt-2">忘记密码</h2>
            <p class="text-body-serif mt-2">别担心，我们会帮您找回账号。</p>
          </div>

          <form v-if="!submitted" @submit.prevent="handleResetRequest" class="mt-10">
            <div class="form-group-v2 mt-6">
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

            <button
              type="submit"
              class="btn-auth-submit btn-block mt-6"
              :disabled="loading"
            >
              <span v-if="loading" class="loading-spinner-v2"></span>
              <span v-else class="flex-center items-center">发送重置链接 <ArrowRightIcon class="icon-xs ml-2" /></span>
            </button>
          </form>

          <div v-else class="success-message mt-8 animate-fade-in">
            <div class="success-icon-box">
              <CheckCircleIcon class="icon-lg text-success" />
            </div>
            <h3 class="text-display text-xl mt-4">邮件已发送</h3>
            <p class="text-body-serif mt-2">我们已向 <strong>{{ email }}</strong> 发送了重置密码链接，请查收邮件并按提示操作。</p>
            <button @click="router.push('/auth/login')" class="btn btn-secondary btn-block mt-8">返回登录</button>
          </div>

          <div v-if="!submitted" class="form-footer-v2 text-serif">
            想起来了？
            <router-link to="/auth/login" class="link-v2">返回登录</router-link>
          </div>
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
import { 
  Mail as MailIcon, 
  ArrowRight as ArrowRightIcon,
  CheckCircle as CheckCircleIcon,
  ShieldCheck as ShieldIcon,
  Lock as LockIcon,
  Key as KeyIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const email = ref('')
const loading = ref(false)
const submitted = ref(false)

const features = [
  { icon: ShieldIcon, label: 'SECURE AUTH', desc: '基于 Supabase 的企业级安全认证', color: '#dfa88f' },
  { icon: LockIcon, label: 'ENCRYPTION', desc: '全链路数据加密保护隐私', color: '#9fc9a2' },
  { icon: KeyIcon, label: 'RECOVERY', desc: '简单快捷的账号找回流程', color: '#c0a8dd' }
]

async function handleResetRequest() {
  if (!email.value) {
    toast.warning('请填写邮箱地址')
    return
  }

  loading.value = true
  try {
    const { error } = await authStore.resetPasswordForEmail(email.value)
    if (error) {
      toast.error('请求失败：' + (error as any).message)
      return
    }
    submitted.value = true
    toast.success('重置链接已发送至您的邮箱')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Reuse styles from LoginPage.vue */
.auth-page {
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-canvas);
  padding: 24px;
}

.auth-container {
  display: flex;
  width: 100%;
  max-width: 1100px;
  min-height: 600px;
  max-height: 760px;
  background-color: var(--color-bg-surface-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-cursor-elevated);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

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

.hero-subheading {
  font-size: 22px;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 4px;
}

.hero-subtitle {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0;
}

.hero-features-v2 {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
}

.auth-form-wrapper {
  flex: 1;
  background-color: var(--color-bg-surface-200);
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

.auth-form {
  width: 100%;
  max-width: 340px;
}

.form-group-v2 {
  margin-bottom: 28px;
}

.label-v2 {
  display: block;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
  margin-bottom: 12px;
}

.input-wrapper-v2 {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-v2 {
  position: absolute;
  left: 14px;
  width: 16px;
  height: 16px;
  color: var(--color-text-tertiary);
  opacity: 0.5;
}

.input-v2 {
  width: 100%;
  height: 44px;
  padding: 0 14px 0 44px;
  background-color: var(--color-bg-surface-300);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-serif);
  font-size: 14px;
  color: var(--color-text-primary);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.input-v2:focus {
  outline: none;
  border-color: var(--color-primary);
  background-color: var(--color-bg-canvas);
  box-shadow: 0 0 0 3px rgba(245, 78, 0, 0.08);
}

.btn-auth-submit {
  width: 100%;
  height: 48px;
  background-color: #ebeae5;
  color: #26251e;
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-auth-submit span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-auth-submit .icon-xs {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-top: 1px;
}

.btn-auth-submit:hover:not(:disabled) {
  color: #cf2d56;
  transform: translateY(-1px);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}

.btn-auth-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-footer-v2 {
  margin-top: 32px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.link-v2 {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.success-message {
  text-align: center;
  padding: 24px 0;
}

.success-icon-box {
  width: 64px;
  height: 64px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* Already adjusted above */

.feature-card-v2 {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
}

.feature-icon-v2 {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.feature-label-v2 {
  font-size: 10px;
  letter-spacing: 0.1em;
  opacity: 0.5;
  margin-bottom: 2px;
}

.feature-desc-v2 {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .auth-container {
    flex-direction: column;
    max-height: none;
  }

  .auth-hero {
    padding: 32px 24px;
  }

  .auth-form-wrapper {
    padding: 32px 24px;
  }

  .hero-title {
    font-size: 28px;
  }
}

@media (max-width: 600px) {
  .auth-page {
    padding: 12px;
  }

  .auth-hero {
    padding: 24px 16px;
  }

  .auth-form-wrapper {
    padding: 24px 16px;
  }

  .hero-features-v2 {
    display: none;
  }
}
</style>
