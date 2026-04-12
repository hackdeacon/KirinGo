<template>
  <div class="auth-page">
    <div class="auth-container animate-fade-in-up">
      <!-- 左侧装饰 -->
      <div class="auth-hero">
        <div class="hero-content">
          <div class="hero-badge text-mono animate-fade-in">
            <div class="badge-dot-live"></div>
            <span>PASSWORD RESET</span>
          </div>
          <h1 class="hero-title text-display">Update your security settings.</h1>
          <p class="hero-subtitle text-serif">请输入您的新密码。请确保密码足够强大，包含字母、数字和特殊字符。</p>
          
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
            <div class="section-tag text-mono">RESET</div>
            <h2 class="text-heading mt-2">重置密码</h2>
            <p class="text-body-serif mt-2">设置一个新的登录密码。</p>
          </div>

          <form @submit.prevent="handleResetPassword" class="mt-8">
            <div class="form-group-v2">
              <label class="label-v2 text-mono">NEW PASSWORD</label>
              <div class="input-wrapper-v2">
                <LockIcon class="input-icon-v2" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input-v2 input-with-right-icon"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  @click="showPassword = !showPassword"
                >
                  <component :is="showPassword ? EyeOffIcon : EyeIcon" class="input-icon-v2" />
                </button>
              </div>

              <!-- 密码强度指示器 -->
              <div v-if="password.length > 0" class="password-strength mt-2">
                <div class="strength-bars">
                  <div
                    v-for="i in 3"
                    :key="i"
                    class="strength-bar"
                    :class="{ active: i <= passwordStrength.level + 1 }"
                    :style="{ backgroundColor: i <= passwordStrength.level + 1 ? passwordStrength.color : 'oklab(0.263084 -0.00230259 0.0124794 / 0.1)' }"
                  ></div>
                </div>
                <span class="strength-text text-mono" :style="{ color: passwordStrength.color }">
                  密码强度：{{ passwordStrength.text }}
                </span>
              </div>

              <!-- 密码要求列表 -->
              <div v-if="password.length > 0" class="password-requirements mt-2">
                <div
                  v-for="req in passwordRequirements"
                  :key="req.text"
                  class="requirement-item"
                >
                  <component
                    :is="req.met ? CheckIcon : XIcon"
                    class="requirement-icon"
                    :class="{ met: req.met }"
                  />
                  <span class="requirement-text text-serif" :class="{ met: req.met }">
                    {{ req.text }}
                  </span>
                </div>
              </div>
            </div>

            <div class="form-group-v2">
              <label class="label-v2 text-mono">CONFIRM PASSWORD</label>
              <div class="input-wrapper-v2">
                <LockIcon class="input-icon-v2" />
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="input-v2 input-with-right-icon"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <component :is="showConfirmPassword ? EyeOffIcon : EyeIcon" class="input-icon-v2" />
                </button>
              </div>

              <!-- 密码匹配提示 -->
              <div
                v-if="confirmPassword.length > 0"
                class="password-match mt-2"
                :class="{ match: password === confirmPassword, mismatch: password !== confirmPassword }"
              >
                <component
                  :is="password === confirmPassword ? CheckIcon : XIcon"
                  class="requirement-icon"
                />
                <span class="requirement-text text-serif">
                  {{ password === confirmPassword ? '密码匹配' : '密码不匹配' }}
                </span>
              </div>
            </div>

            <button
              type="submit"
              class="btn-auth-submit btn-block mt-6"
              :disabled="loading"
            >
              <span v-if="loading" class="loading-spinner-v2"></span>
              <span v-else class="flex-center">更新密码 <ArrowRightIcon class="icon-xs ml-2" /></span>
            </button>
          </form>

          <div class="form-footer-v2 text-serif">
            想要取消？
            <router-link to="/auth/login" class="link-v2">返回登录</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import {
  Lock as LockIcon,
  ArrowRight as ArrowRightIcon,
  ShieldCheck as ShieldIcon,
  Key as KeyIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Check as CheckIcon,
  X as XIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 密码强度计算
const passwordStrength = computed(() => {
  let score = 0
  const pwd = password.value

  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++

  if (score <= 1) return { level: 0, text: '弱', color: '#cf2d56' }
  if (score <= 3) return { level: 1, text: '中', color: '#c08532' }
  return { level: 2, text: '强', color: '#1f8a65' }
})

// 密码要求检查
const passwordRequirements = computed(() => {
  const pwd = password.value
  return [
    { text: '至少 6 个字符', met: pwd.length >= 6 },
    { text: '包含小写和大写字母', met: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) },
    { text: '包含至少一个数字', met: /\d/.test(pwd) }
  ]
})

const features = [
  { icon: ShieldIcon, label: 'SECURE AUTH', desc: '基于 Supabase 的企业级安全认证', color: '#dfa88f' },
  { icon: LockIcon, label: 'ENCRYPTION', desc: '全链路数据加密保护隐私', color: '#9fc9a2' },
  { icon: KeyIcon, label: 'RECOVERY', desc: '简单快捷的账号找回流程', color: '#c0a8dd' }
]

// Supabase 会通过 URL hash 自动处理恢复会话
// 我们只需确保用户能成功提交新密码
async function handleResetPassword() {
  if (!password.value || !confirmPassword.value) {
    toast.warning('请填写完整密码')
    return
  }

  if (password.value !== confirmPassword.value) {
    toast.warning('两次填写的密码不一致')
    return
  }

  if (password.value.length < 6) {
    toast.warning('密码长度至少为 6 位')
    return
  }

  loading.value = true
  try {
    const { error } = await authStore.updatePassword(password.value)
    if (error) {
      toast.error('重置失败：' + (error as any).message)
      return
    }
    toast.success('密码已成功重置，请重新登录')
    await authStore.signOut()
    router.push('/auth/login')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 检查是否是通过重置链接进入的
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    // 如果没有会话，说明不是通过合法链接进入的（或者链接已过期）
    toast.error('重置链接无效或已过期，请重新申请')
    router.push('/auth/forgot-password')
  }
})
</script>

<style scoped>
/* Same styles as ForgotPasswordPage.vue */
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
  max-height: 800px;
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

.hero-subtitle {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 24px;
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
  margin-bottom: 16px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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

.hero-features-v2 {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
}

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

/* Password visibility toggle */
.input-with-right-icon {
  padding-right: 44px !important;
}

.password-toggle-btn {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.password-toggle-btn:hover {
  opacity: 0.8;
}

/* Password strength indicator */
.password-strength {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.strength-text {
  font-size: 11px;
  letter-spacing: 0.1em;
  white-space: nowrap;
}

/* Password requirements */
.password-requirements {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.requirement-icon {
  width: 12px;
  height: 12px;
}

.requirement-icon.met {
  color: #1f8a65;
}

.requirement-icon:not(.met) {
  color: #cf2d56;
}

.requirement-text {
  font-size: 11px;
  color: rgba(38, 37, 30, 0.55);
}

.requirement-text.met {
  color: #1f8a65;
  text-decoration: line-through;
}

/* Password match indicator */
.password-match {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.password-match.match .requirement-icon {
  color: #1f8a65;
}

.password-match.match .requirement-text {
  color: #1f8a65;
}

.password-match.mismatch .requirement-icon {
  color: #cf2d56;
}

.password-match.mismatch .requirement-text {
  color: #cf2d56;
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
