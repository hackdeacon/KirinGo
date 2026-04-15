<template>
  <div class="company-settings-page animate-fade-in">
    <div class="container-layout">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">公司设置</h1>
          <p class="page-subtitle text-body-serif">完善企业信息，展示公司实力，吸引顶尖人才</p>
        </div>
        <div class="header-actions">
          <button
            class="btn btn-primary btn-lg"
            @click="handleSave"
            :disabled="saving"
            :class="{ 'opacity-70 cursor-not-allowed': saving }"
          >
            <component
              :is="saving ? LoaderIcon : SaveIcon"
              class="icon-sm mr-2"
              :class="{ 'animate-spin': saving }"
            />
            {{ companyId ? '保存更改' : '创建公司' }}
          </button>
        </div>
      </div>

      <div class="main-layout">
        <!-- 左侧：表单区域 -->
        <div class="form-main">
          <!-- 基本资料 -->
          <section class="form-section card">
            <div class="section-header">
              <h2 class="section-title">基本资料</h2>
              <p class="section-description text-body-serif text-tertiary">这些信息会公开显示在公司主页，帮助求职者了解您的企业</p>
            </div>
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label text-mono">
                  公司全称
                  <span class="required-star">*</span>
                </label>
                <input
                  v-model="form.name"
                  class="form-input"
                  placeholder="请输入营业执照上的完整公司名称"
                  :class="{ 'border-error': !form.name && touched.name }"
                  @blur="touched.name = true"
                />
                <p v-if="!form.name && touched.name" class="input-hint text-error">请输入公司名称</p>
              </div>

              <div class="form-group">
                <label class="form-label text-mono">行业领域</label>
                <input
                  v-model="form.industry"
                  class="form-input"
                  placeholder="如：人工智能、互联网、金融科技"
                />
              </div>

              <div class="form-group">
                <label class="form-label text-mono">公司规模</label>
                <select v-model="form.scale" class="form-input">
                  <option value="0-19人">0-19人</option>
                  <option value="20-99人">20-99人</option>
                  <option value="100-499人">100-499人</option>
                  <option value="500-999人">500-999人</option>
                  <option value="1000人以上">1000人以上</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label text-mono">融资阶段</label>
                <select v-model="form.financing" class="form-input">
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
                <input
                  v-model="form.website"
                  class="form-input"
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          <!-- 公司介绍 -->
          <section class="form-section card mt-6">
            <div class="section-header">
              <h2 class="section-title">公司介绍</h2>
              <p class="section-description text-body-serif text-tertiary">真诚地介绍公司的业务、文化和愿景，吸引价值观匹配的候选人</p>
            </div>
            <div class="form-group">
              <label class="form-label text-mono">详细介绍</label>
              <textarea
                v-model="form.description"
                class="form-input textarea text-serif"
                rows="12"
                placeholder="推荐内容：公司成立背景、主营业务、企业文化、团队介绍、福利待遇、晋升空间等..."
              ></textarea>
              <div class="textarea-footer">
                <span class="char-count text-tertiary text-tiny">
                  {{ form.description.length }} 字符
                </span>
              </div>
            </div>
          </section>

          <!-- 地址信息 -->
          <section class="form-section card mt-6 mb-6">
            <div class="section-header">
              <h2 class="section-title">办公地址</h2>
              <p class="section-description text-body-serif text-tertiary">准确的地址帮助求职者判断工作地点是否合适</p>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label text-mono">所在城市</label>
                <input
                  v-model="form.city"
                  class="form-input"
                  placeholder="如：北京市"
                />
              </div>
              <div class="form-group full-width">
                <label class="form-label text-mono">详细地址</label>
                <input
                  v-model="form.address"
                  class="form-input"
                  placeholder="街道、大厦、楼层等详细信息"
                />
              </div>
            </div>
          </section>

          <!-- 底部浮动保存按钮（仅移动端可见） -->
          <div class="mobile-fixed-footer">
            <button
              class="btn btn-primary btn-lg w-full"
              @click="handleSave"
              :disabled="saving"
            >
              <component
                :is="saving ? LoaderIcon : SaveIcon"
                class="icon-sm mr-2"
                :class="{ 'animate-spin': saving }"
              />
              {{ companyId ? '保存更改' : '创建公司' }}
            </button>
          </div>
        </div>

        <!-- 右侧：侧边栏 -->
        <aside class="form-sidebar">
          <div class="sidebar-inner sidebar-sticky">
            <!-- Logo 上传 -->
            <div class="sidebar-card card">
              <h3 class="sidebar-card-title">公司 Logo</h3>
              <div
                class="logo-upload-area"
                :class="{ 'has-logo': form.logo_url }"
                @click="triggerLogoUpload"
                @dragover.prevent
                @drop.prevent="handleDrop"
              >
                <div v-if="form.logo_url" class="logo-preview">
                  <img :src="form.logo_url" alt="公司 Logo" class="logo-image" />
                  <div class="logo-overlay">
                    <span class="overlay-text">点击更换</span>
                  </div>
                </div>
                <div v-else class="logo-placeholder">
                  <BuildingIcon class="icon-xl opacity-25 mb-3" />
                  <p class="placeholder-text text-secondary">
                    点击或拖拽上传 Logo
                  </p>
                  <p class="placeholder-hint text-tiny text-tertiary mt-1">
                    推荐尺寸 200x200px
                  </p>
                </div>
                <input
                  ref="logoInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleLogoChange"
                />
              </div>
              <p v-if="uploading" class="upload-status text-tiny text-tertiary mt-3">
                <LoaderIcon class="icon-xs inline animate-spin mr-1" />
                上传中...
              </p>
              <p class="help-text text-tiny text-tertiary mt-3">
                支持 JPG、PNG、WebP 格式。Logo 会显示在职位列表和公司主页。
              </p>
            </div>

            <!-- 提示卡片 -->
            <div class="info-card sidebar-card card mt-6">
              <h3 class="sidebar-card-title">为什么要完善信息？</h3>
              <ul class="info-list text-body-serif">
                <li class="info-item">
                  ✓ 完善的公司信息更容易获得求职者信任
                </li>
                <li class="info-item">
                  ✓ 吸引更加匹配公司文化的候选人
                </li>
                <li class="info-item">
                  ✓ 在求职者浏览职位时展示企业形象
                </li>
              </ul>
            </div>

            <!-- 预览提示 -->
            <div class="preview-card sidebar-card card mt-6">
              <h3 class="sidebar-card-title">效果预览</h3>
              <p class="preview-desc text-body-serif text-secondary mb-4">
                保存信息后，求职者可以在公共主页看到您完整的公司介绍。
              </p>
              <router-link to="/companies" target="_blank" class="btn btn-ghost btn-sm w-full">
                查看公司列表
                <ExternalLinkIcon class="icon-xs ml-1" />
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
import { supabase } from '@/lib/supabase'
import { fetchCompanyByRecruiter, updateCompany, uploadAvatarFile } from '@/lib/database'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { Company } from '@/types'
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

const touched = reactive({
  name: false
})

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

function handleDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0]
  if (!file || !authStore.user) return
  processLogoUpload(file)
}

async function handleLogoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !authStore.user) return
  processLogoUpload(file)
}

async function processLogoUpload(file: File) {
  if (!file.type.startsWith('image/')) {
    toast.error('请上传图片文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error('图片大小不能超过 5MB')
    return
  }

  uploading.value = true
  try {
    const logoUrl = await uploadAvatarFile(authStore.user!.id, file)
    form.logo_url = logoUrl
    toast.success('Logo 上传成功')
  } catch (error) {
    toast.error('上传失败，请重试')
  } finally {
    uploading.value = false
  }
}

async function handleSave() {
  if (!form.name.trim()) {
    touched.name = true
    toast.error('公司名称不能为空')
    return
  }

  saving.value = true
  try {
    const recruiterId = authStore.user!.id
    if (companyId.value) {
      // 更新已有公司信息
      await updateCompany(companyId.value, {
        ...form
      })
      // 更新成功后重新加载数据确保同步
      await loadCompanyData()
      toast.success('公司信息已更新')
    } else {
      // 创建新公司
      const { data, error } = await supabase
        .from('companies')
        .insert({
          ...form,
          recruiter_id: recruiterId,
        })
        .select('id')
        .single()

      if (error) throw error
      companyId.value = data.id
      toast.success('公司信息已创建')
    }
  } catch (error: any) {
    console.error('保存公司信息失败:', error)
    toast.error('保存失败：' + error.message)
  } finally {
    saving.value = false
  }
}

onMounted(loadCompanyData)
</script>

<style scoped>
.company-settings-page {
  padding: 48px 0 80px;
  background-color: var(--color-bg-canvas);
  min-height: calc(100vh - 80px);
}

.container-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.72px;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.page-subtitle {
  font-size: 17.28px;
  line-height: 1.35;
  color: var(--color-text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 主布局 */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
  align-items: start;
}

/* 表单区域 */
.form-section {
  padding: 32px;
}

.section-header {
  margin-bottom: 28px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -0.11px;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}

.section-description {
  font-size: 15px;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.required-star {
  color: var(--color-error);
  margin-left: 2px;
}

.form-input {
  padding: 10px 12px;
  background-color: var(--color-bg-canvas);
  border: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  border-radius: 8px;
  font-size: 15px;
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  transition: all 0.15s ease;
}

.form-input:hover {
  border-color: oklab(0.263084 -0.00230259 0.0124794 / 0.18);
}

.form-input:focus {
  outline: none;
  border-color: oklab(0.263084 -0.00230259 0.0124794 / 0.28);
  box-shadow: 0 0 0 1px oklab(0.263084 -0.00230259 0.0124794 / 0.28);
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}

.textarea {
  resize: vertical;
  min-height: 180px;
  line-height: 1.6;
}

.textarea-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}

.input-hint {
  margin: 4px 0 0;
  font-size: 12px;
}

.char-count {
  font-size: 12px;
}

/* 侧边栏 */
.form-sidebar {
  width: 100%;
}

.sidebar-inner {
  width: 100%;
}

.sidebar-sticky {
  position: sticky;
  top: 100px;
}

.sidebar-card {
  padding: 24px 20px;
}

.sidebar-card-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-primary);
  margin: 0 0 16px;
}

/* Logo 上传区域 */
.logo-upload-area {
  position: relative;
  border: 2px dashed oklab(0.263084 -0.00230259 0.0124794 / 0.15);
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;
}

.logo-upload-area:hover {
  border-color: oklab(0.263084 -0.00230259 0.0124794 / 0.25);
  background-color: var(--color-bg-surface-100);
}

.logo-upload-area.has-logo {
  border-style: solid;
  border-color: oklab(0.263084 -0.00230259 0.0124794 / 0.15);
  padding: 0;
}

.logo-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: white;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(38, 37, 30, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.logo-preview:hover .logo-overlay {
  opacity: 1;
}

.overlay-text {
  color: white;
  font-size: 14px;
  font-family: var(--font-display);
}

.logo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.placeholder-text {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.placeholder-hint {
  margin: 0;
}

.upload-status {
  display: flex;
  align-items: center;
}

.help-text {
  line-height: 1.5;
}

/* 信息卡片 */
.info-card {
  background-color: var(--color-bg-surface-100);
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-item {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  padding: 6px 0;
}

/* 预览卡片 */
.preview-card {
  background-color: var(--color-bg-surface-100);
}

.preview-desc {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

/* 移动端底部固定按钮 */
.mobile-fixed-footer {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 24px;
  background-color: var(--color-bg-canvas);
  border-top: 1px solid oklab(0.263084 -0.00230259 0.0124794 / 0.1);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

/* 响应式 */
@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .sidebar-sticky {
    position: static;
  }

  .form-sidebar {
    order: -1;
  }

  .logo-upload-area {
    max-width: 200px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .company-settings-page {
    padding: 32px 0 100px;
  }

  .container-layout {
    padding: 0 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-title {
    font-size: 28px;
    letter-spacing: -0.325px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    flex: 1;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .full-width {
    grid-column: auto;
  }

  .form-section {
    padding: 24px 20px;
  }

  .mobile-fixed-footer {
    display: block;
  }
}

@media (max-width: 640px) {
  .header-actions {
    display: none;
  }
}

.border-error {
  border-color: var(--color-error) !important;
}

.text-error {
  color: var(--color-error);
}

.mt-6 {
  margin-top: 24px;
}

.mb-6 {
  margin-bottom: 24px;
}

.w-full {
  width: 100%;
}

.text-center {
  text-align: center;
}

.mr-2 {
  margin-right: 8px;
}

.ml-1 {
  margin-left: 4px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-1 {
  margin-top: 4px;
}

.mt-4 {
  margin-top: 16px;
}

.opacity-70 {
  opacity: 0.7;
}

.opacity-25 {
  opacity: 0.25;
}

.cursor-not-allowed {
  cursor: not-allowed;
}

.hidden {
  display: none;
}

.inline {
  display: inline;
}
</style>
