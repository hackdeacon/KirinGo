<template>
  <transition name="modal-fade">
    <div v-if="aiConfig.isSettingsOpen" class="modal-overlay" @click.self="aiConfig.closeSettings">
      <div class="modal-container card animate-scale-up" role="dialog" aria-modal="true">
        <!-- 弹窗头部 -->
        <div class="modal-header">
          <div class="modal-title-group">
            <div class="ai-chip text-mono">
              <span class="pulse-dot"></span>
              AI ENGINE CORE
            </div>
            <h2 class="text-heading text-xl mt-2">AI 模型与引擎设置</h2>
            <p class="text-body-serif text-xs text-tertiary mt-1">
              自定义您的专属 API 凭证与模型，配置将持久化保存在当前浏览器本地。
            </p>
          </div>
          <button class="close-btn" @click="aiConfig.closeSettings" title="关闭">
            <XIcon class="icon-sm" />
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="modal-body">
          <!-- 预设选择器 -->
          <div class="form-group mb-6">
            <label class="form-label text-mono">选择提供商预设</label>
            <div class="provider-grid">
              <button
                v-for="(preset, key) in PROVIDER_PRESETS"
                :key="key"
                class="provider-btn"
                :class="{ active: localProvider === key }"
                @click="selectProvider(key)"
              >
                <div class="provider-name">{{ preset.name }}</div>
                <div class="provider-hint text-tiny text-tertiary">{{ preset.defaultModel }}</div>
              </button>
            </div>
          </div>

          <!-- API Key 输入 -->
          <div class="form-group mb-5">
            <div class="flex-between mb-2">
              <label class="form-label text-mono">API Key <span class="text-orange">*</span></label>
              <a
                v-if="localProvider === 'chatanywhere'"
                href="https://chatanywhere.tech/"
                target="_blank"
                rel="noopener noreferrer"
                class="link-text text-tiny"
              >
                免费获取 ChatAnywhere Key ↗
              </a>
              <a
                v-else-if="localProvider === 'deepseek'"
                href="https://platform.deepseek.com/"
                target="_blank"
                rel="noopener noreferrer"
                class="link-text text-tiny"
              >
                获取 DeepSeek Key ↗
              </a>
            </div>
            <div class="input-password-wrapper">
              <input
                :type="showKey ? 'text' : 'password'"
                v-model="localKey"
                class="input text-mono"
                placeholder="sk-..."
                autocomplete="off"
              />
              <button
                type="button"
                class="toggle-visibility-btn"
                @click="showKey = !showKey"
                tabindex="-1"
              >
                <EyeOffIcon v-if="showKey" class="icon-xs" />
                <EyeIcon v-else class="icon-xs" />
              </button>
            </div>
            <p class="text-tiny text-tertiary mt-1.5">
              填写后将覆盖线上所有默认环境变量，仅在您本地浏览器生效。
            </p>
          </div>

          <!-- Base URL -->
          <div class="form-group mb-5">
            <label class="form-label text-mono">接口地址 (Base URL)</label>
            <input
              type="text"
              v-model="localBaseUrl"
              class="input text-mono"
              placeholder="https://api.chatanywhere.tech/v1"
            />
          </div>

          <!-- Model -->
          <div class="form-group mb-6">
            <label class="form-label text-mono">模型标识 (Model)</label>
            <input
              type="text"
              v-model="localModel"
              class="input text-mono"
              placeholder="gpt-4o-mini 或 deepseek-chat"
            />
          </div>

          <!-- 测试结果卡片 -->
          <div v-if="aiConfig.testResult" class="test-result-card card-sm mb-6" :class="{ 'is-ok': aiConfig.testResult.ok, 'is-err': !aiConfig.testResult.ok }">
            <div class="flex-center">
              <CheckCircleIcon v-if="aiConfig.testResult.ok" class="icon-sm text-success mr-2" />
              <AlertCircleIcon v-else class="icon-sm text-error mr-2" />
              <span class="test-msg text-mono text-xs">{{ aiConfig.testResult.message }}</span>
            </div>
            <span v-if="aiConfig.testResult.latency" class="test-latency text-mono text-tiny">
              {{ aiConfig.testResult.latency }}ms
            </span>
          </div>
        </div>

        <!-- 弹窗底部 -->
        <div class="modal-footer">
          <button class="btn btn-ghost btn-sm" @click="handleReset" title="清空本地配置，恢复系统默认">
            恢复系统预设
          </button>
          <div class="footer-right-actions">
            <button
              class="btn btn-secondary btn-sm"
              @click="handleTest"
              :disabled="aiConfig.isTesting || !localKey.trim()"
            >
              <LoaderIcon v-if="aiConfig.isTesting" class="icon-xs animate-spin mr-1" />
              <ZapIcon v-else class="icon-xs mr-1" />
              {{ aiConfig.isTesting ? '正在测试...' : '测试连通性' }}
            </button>
            <button class="btn btn-primary btn-sm" @click="handleSave">
              <SaveIcon class="icon-xs mr-1" /> 保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAIConfigStore, PROVIDER_PRESETS, type AIProvider } from '@/stores/aiConfig'
import { useToast } from '@/composables/useToast'
import {
  X as XIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Zap as ZapIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Loader2 as LoaderIcon
} from 'lucide-vue-next'

const aiConfig = useAIConfigStore()
const toast = useToast()

const showKey = ref(false)
const localProvider = ref<AIProvider>('chatanywhere')
const localKey = ref('')
const localBaseUrl = ref('')
const localModel = ref('')

// 同步回显
watch(
  () => aiConfig.isSettingsOpen,
  (open) => {
    if (open) {
      localProvider.value = aiConfig.activeProvider
      localKey.value = aiConfig.customApiKey
      localBaseUrl.value = aiConfig.customBaseUrl || PROVIDER_PRESETS[aiConfig.activeProvider]?.baseUrl || ''
      localModel.value = aiConfig.customModel || PROVIDER_PRESETS[aiConfig.activeProvider]?.defaultModel || ''
    }
  },
  { immediate: true }
)

function selectProvider(key: AIProvider) {
  localProvider.value = key
  const preset = PROVIDER_PRESETS[key]
  if (preset) {
    localBaseUrl.value = preset.baseUrl
    localModel.value = preset.defaultModel
  }
}

async function handleTest() {
  const result = await aiConfig.testConnection({
    apiKey: localKey.value,
    baseUrl: localBaseUrl.value,
    model: localModel.value,
  })
  if (result?.ok) {
    toast.success(`测试通过！响应耗时 ${result.latency}ms`)
  } else {
    toast.error(`测试失败：${result?.message || '无法连接到模型接口'}`)
  }
}

function handleSave() {
  aiConfig.saveConfig({
    apiKey: localKey.value,
    baseUrl: localBaseUrl.value,
    model: localModel.value,
    provider: localProvider.value,
  })
  toast.success('AI 引擎配置已成功保存至本地！全站功能立即生效')
  aiConfig.closeSettings()
}

function handleReset() {
  aiConfig.resetToDefaults()
  localKey.value = ''
  localBaseUrl.value = PROVIDER_PRESETS.chatanywhere.baseUrl
  localModel.value = PROVIDER_PRESETS.chatanywhere.defaultModel
  localProvider.value = 'chatanywhere'
  toast.info('已恢复系统默认设置')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-container {
  width: 100%;
  max-width: 580px;
  background-color: var(--color-bg-surface-100);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-xl);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 28px 32px 20px;
  border-bottom: 1px solid var(--color-border);
}

.ai-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  letter-spacing: 0.15em;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background-color: rgba(245, 78, 0, 0.1);
  color: var(--color-primary);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-primary);
  box-shadow: 0 0 8px var(--color-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.close-btn:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-surface-300);
}

.modal-body {
  padding: 24px 32px;
  overflow-y: auto;
}

.provider-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 8px;
}

.provider-btn {
  text-align: left;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-surface-200);
  cursor: pointer;
  transition: all 0.2s;
}

.provider-btn:hover {
  border-color: var(--color-border-strong);
  background-color: var(--color-bg-surface-300);
}

.provider-btn.active {
  border-color: var(--color-primary);
  background-color: rgba(245, 78, 0, 0.05);
}

.provider-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.input-password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-visibility-btn {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 4px;
}

.toggle-visibility-btn:hover {
  color: var(--color-text-primary);
}

.link-text {
  color: var(--color-primary);
  text-decoration: none;
  font-family: var(--font-mono);
}

.link-text:hover {
  text-decoration: underline;
}

.test-result-card {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--color-border);
}

.test-result-card.is-ok {
  background-color: rgba(31, 138, 101, 0.08);
  border-color: rgba(31, 138, 101, 0.3);
}

.test-result-card.is-err {
  background-color: rgba(207, 45, 86, 0.08);
  border-color: rgba(207, 45, 86, 0.3);
}

.modal-footer {
  padding: 20px 32px;
  background-color: var(--color-bg-surface-200);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-right-actions {
  display: flex;
  gap: 12px;
}

.animate-scale-up {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
