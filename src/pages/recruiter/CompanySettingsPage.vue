<template>
  <div class="company-settings-page animate-fade-in">
    <div class="container-cursor">
      <div class="page-header-v2">
        <div class="header-left">
          <h1 class="text-display text-3xl mb-2">公司设置</h1>
          <p class="text-body-serif text-tertiary">完善企业信息，展示公司实力，吸引顶尖人才。</p>
        </div>
        <button class="btn btn-primary" @click="handleSave" :disabled="saving">
          <component :is="saving ? LoaderIcon : SaveIcon" class="icon-sm mr-2" :class="{ 'animate-spin': saving }" />
          保存更改
        </button>
      </div>

      <div class="form-layout">
        <div class="form-main">
          <!-- 基本资料 -->
          <section class="form-section card mb-8">
            <h2 class="section-title text-display">基本资料</h2>
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label text-mono">公司全称</label>
                <input v-model="form.name" class="input" placeholder="请输入营业执照上的公司名称" />
              </div>
              <div class="form-group">
                <label class="form-label text-mono">行业领域</label>
                <input v-model="form.industry" class="input" placeholder="如：人工智能、互联网、金融科技" />
              </div>
              <div class="form-group">
                <label class="form-label text-mono">公司规模</label>
                <select v-model="form.scale" class="input">
                  <option value="0-19人">0-19人</option>
                  <option value="20-99人">20-99人</option>
                  <option value="100-499人">100-499人</option>
                  <option value="500-999人">500-999人</option>
                  <option value="1000人以上">1000人以上</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label text-mono">融资阶段</label>
                <select v-model="form.financing" class="input">
                  <option value="未融资">未融资</option>
                  <option value="天使轮">天使轮</option>
                  <option value="A轮">A轮</option>
                  <option value="B轮">B轮</option>
                  <option value="C轮及以上">C轮及以上</option>
                  <option value="已上市">已上市</option>
                  <option value="不需要融资">不需要融资</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label text-mono">公司官网</label>
                <input v-model="form.website" class="input" placeholder="https://..." />
              </div>
            </div>
          </section>

          <!-- 公司介绍 -->
          <section class="form-section card mb-8">
            <h2 class="section-title text-display">公司介绍</h2>
            <div class="form-group">
              <label class="form-label text-mono">详细介绍</label>
              <textarea v-model="form.description" class="input text-serif" rows="10" placeholder="介绍公司的愿景、文化、福利待遇等..."></textarea>
            </div>
          </section>

          <!-- 地址信息 -->
          <section class="form-section card">
            <h2 class="section-title text-display">办公地址</h2>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label text-mono">所在城市</label>
                <input v-model="form.city" class="input" placeholder="如：北京" />
              </div>
              <div class="form-group full-width">
                <label class="form-label text-mono">详细地址</label>
                <input v-model="form.address" class="input" placeholder="街道、大厦、楼层等信息" />
              </div>
            </div>
          </section>
        </div>

        <aside class="form-sidebar">
          <div class="sidebar-sticky">
            <!-- 公司 Logo 上传 -->
            <div class="logo-upload-card card">
              <h3 class="text-display mb-6">公司 Logo</h3>
              <div class="logo-preview-box">
                <div v-if="form.logo_url" class="logo-img-wrapper">
                  <img :src="form.logo_url" alt="Company Logo" class="logo-img" />
                </div>
                <div v-else class="logo-placeholder">
                  <BuildingIcon class="icon-lg opacity-20" />
                </div>
                <button class="btn btn-secondary btn-sm mt-4 w-full" @click="triggerLogoUpload" :disabled="uploading">
                  {{ uploading ? '上传中...' : '上传 Logo' }}
                </button>
                <input ref="logoInput" type="file" accept="image/*" class="hidden" @change="handleLogoChange" />
              </div>
              <p class="text-tiny text-tertiary mt-4">建议尺寸 200x200px，支持 JPG、PNG、WebP。</p>
            </div>

            <div class="preview-card card mt-6">
              <h3 class="text-display mb-4">效果预览</h3>
              <p class="text-tiny text-secondary mb-6">完善信息后，您的公司主页将以最专业的方式呈现给求职者。</p>
              <router-link to="/about" class="btn btn-ghost btn-sm w-full">
                查看示例页面 <ExternalLinkIcon class="icon-xs ml-1" />
              </router-link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { fetchCompanyByRecruiter, updateCompany, uploadAvatarFile } from '@/lib/database'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import {
  Save as SaveIcon,
  Loader2 as LoaderIcon,
  Building2 as BuildingIcon,
  ExternalLink as ExternalLinkIcon
} from 'lucide-vue-next'

const authStore = useAuthStore()
const toast = useToast()

const saving = ref(false)
const uploading = ref(false)
const logoInput = ref<HTMLInputElement>()
const companyId = ref<string | null>(null)

const form = reactive({
  name: '',
  industry: '',
  scale: '20-99人',
  financing: '未融资',
  website: '',
  description: '',
  city: '',
  address: '',
  logo_url: '',
})

async function loadCompanyData() {
  const recruiterId = authStore.user?.id
  if (!recruiterId) return

  try {
    const company = await fetchCompanyByRecruiter(recruiterId)
    if (company) {
      companyId.value = company.id
      Object.assign(form, {
        name: company.name || '',
        industry: company.industry || '',
        scale: company.scale || '20-99人',
        financing: company.financing || '未融资',
        website: company.website || '',
        description: company.description || '',
        city: company.city || '',
        address: company.address || '',
        logo_url: company.logo_url || '',
      })
    }
  } catch (error) {
    toast.error('加载公司信息失败')
  }
}

function triggerLogoUpload() {
  logoInput.value?.click()
}

async function handleLogoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !authStore.user) return

  uploading.value = true
  try {
    // 借用头像上传逻辑，路径稍微区别
    const logoUrl = await uploadAvatarFile(authStore.user.id, file)
    form.logo_url = logoUrl
    toast.success('Logo 已上传')
  } catch (error) {
    toast.error('上传失败')
  } finally {
    uploading.value = false
  }
}

async function handleSave() {
  if (!form.name) {
    toast.error('公司名称不能为空')
    return
  }

  saving.value = true
  try {
    if (companyId.value) {
      await updateCompany(companyId.value, form)
      toast.success('公司信息已更新')
    } else {
      // 如果没有公司记录，可以调用一个 createCompany，
      // 考虑到 DB 约束，这里先假定每个 recruiter 都有关联公司记录
      toast.info('请联系管理员为您初始化公司账户')
    }
  } catch (error) {
    toast.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(loadCompanyData)
</script>

<style scoped>
.company-settings-page {
  padding: 60px 0 120px;
  background-color: var(--color-bg-canvas);
  min-height: calc(100vh - 80px);
}

.page-header-v2 {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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

.sidebar-sticky {
  position: sticky;
  top: 108px;
}

.logo-upload-card {
  padding: 32px 24px;
  text-align: center;
}

.logo-preview-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-img-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: white;
}

.logo-placeholder {
  width: 120px;
  height: 120px;
  background: var(--color-bg-surface-300);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-card {
  padding: 24px;
  background-color: var(--color-bg-surface-200);
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
