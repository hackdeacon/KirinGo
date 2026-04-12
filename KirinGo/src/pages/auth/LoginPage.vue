<template>
  <div class="auth-page">
    <div class="auth-container animate-fade-in-up">
      <!-- 左侧装饰 - Cursor Dark Mode Moment -->
      <div class="auth-hero">
        <div class="hero-content">
          <div class="hero-badge text-mono animate-fade-in">
            <div class="badge-dot-live"></div>
            <span>NEXT-GEN RECRUITMENT</span>
          </div>
          <h1 class="hero-title text-display">Build your future with KirinGo.</h1>
          <p class="hero-subtitle text-serif">加入全球领先的 AI 招聘社区，探索由大语言模型驱动的职业发展新路径。</p>
          
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

      <!-- 右侧表单 - Warm Minimalism -->
      <div class="auth-form-wrapper">
        <div class="auth-form">
          <div class="form-header-v2">
            <div class="section-tag text-mono">AUTHENTICATION</div>
            <h2 class="text-heading mt-2">欢迎回来</h2>
            <p class="text-body-serif mt-2">请登录您的账号以继续使用 AI 招聘功能。</p>
          </div>

          <form @submit.prevent="handleLogin" class="mt-8">
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
              <div class="label-row-v2">
                <label class="label-v2 text-mono">PASSWORD</label>
                <router-link to="/auth/forgot-password" class="text-micro-link text-mono">FORGOT?</router-link>
              </div>
              <div class="input-wrapper-v2">
                <LockIcon class="input-icon-v2" />
                <input
                  v-model="password"
                  type="password"
                  class="input-v2"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              class="btn-auth-submit btn-block mt-8"
              :disabled="loading"
            >
              <span v-if="loading" class="loading-spinner-v2"></span>
              <span v-else class="flex-center">立即登录 <ArrowRightIcon class="icon-xs ml-2" /></span>
            </button>
          </form>

          <div class="form-footer-v2 text-serif">
            还没有账号？
            <router-link to="/auth/register" class="link-v2">创建新账号</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { 
  Mail as MailIcon, 
  Lock as LockIcon, 
  ArrowRight as ArrowRightIcon,
  Sparkles as SparklesIcon,
  Target as TargetIcon,
  Mic as MicIcon,
  MessageSquare as MessageSquareIcon
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)

const features = [
  { icon: SparklesIcon, label: 'AI AUDIT', desc: '简历深度诊断与关键词覆盖优化', color: '#dfa88f' },
  { icon: TargetIcon, label: 'SMART MATCH', desc: '多维度职位契合度精准分析', color: '#9fc9a2' },
  { icon: MicIcon, label: 'AI INTERVIEW', desc: '全真模拟技术与 HR 面试场景', color: '#c0a8dd' },
  { icon: MessageSquareIcon, label: 'INSTANT CHAT', desc: '与招聘者实时在线沟通', color: '#9fbbe0' }
]

async function handleLogin() {
  if (!email.value || !password.value) {
    toast.warning('请填写邮箱和密码')
    return
  }

  loading.value = true
  try {
    const { error } = await authStore.signIn(email.value, password.value)
    if (error) {
      let msg = (error as any).message
      if (msg === 'Email not confirmed') {
        msg = '您的邮箱尚未验证，请点击邮件中的链接完成验证后再登录'
      } else if (msg === 'Invalid login credentials') {
        msg = '邮箱或密码错误'
      }
      toast.error('登录失败：' + msg)
      return
    }
    toast.success('登录成功！')
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; /* Full height - no header on auth pages */
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
  max-height: 720px; /* Cap for ultra-wide but still fit on most screens */
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

.hero-features-v2 {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-card-v2 {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}

.feature-card-v2:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateX(8px);
}

.feature-icon-v2 {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-label-v2 {
  font-size: 9px;
  letter-spacing: 0.1em;
  margin-bottom: 2px;
  opacity: 0.4;
}

.feature-desc-v2 {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

/* Form Section (Warm Light) */
.auth-form-wrapper {
  flex: 1;
  padding: 48px;
  background-color: var(--color-bg-canvas);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto; /* Allow form scroll if screen is very short */
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

.label-row-v2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.text-micro-link {
  font-size: 10px;
  color: var(--color-text-tertiary);
  text-decoration: none;
  letter-spacing: 0.05em;
  transition: color 0.2s;
}

.text-micro-link:hover {
  color: var(--color-primary);
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

.icon-xs {
  width: 16px;
  height: 16px;
}

.flex-center { display: flex; align-items: center; }
.ml-2 { margin-left: 8px; }
.mt-2 { margin-top: 8px; }
.mt-8 { margin-top: 24px; } /* Reduced from 32px */

@media (max-width: 1024px) {
  .auth-hero { display: none; }
  .auth-container { max-width: 500px; max-height: 600px; }
  .auth-form-wrapper { padding: 40px; }
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
