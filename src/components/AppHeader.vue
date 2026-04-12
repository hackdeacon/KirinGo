<template>
  <header class="app-header" :class="{ 'is-scrolled': scrolled }">
    <div class="header-inner">
      <!-- 左上角: Logo 胶囊 -->
      <div class="capsule logo-capsule">
        <router-link to="/" class="logo" @click="closeAll">
          <div class="logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.483 1.123a1.09 1.09 0 0 0-.752.362 1.09 1.09 0 0 0 .088 1.54 11.956 11.956 0 0 1 4 8.946 7.62 7.62 0 0 1-7.637 7.636 7.62 7.62 0 0 1-7.637-7.636 3.255 3.255 0 0 1 3.273-3.273c1.82 0 3.273 1.45 3.273 3.273a1.09 1.09 0 0 0 1.09 1.09 1.09 1.09 0 0 0 1.092-1.09c0-3-2.455-5.455-5.455-5.455s-5.454 2.455-5.454 5.455c0 5.408 4.408 9.818 9.818 9.818 5.41 0 9.818-4.41 9.818-9.818A14.16 14.16 0 0 0 19.272 1.4a1.09 1.09 0 0 0-.789-.277ZM9.818 2.15C4.408 2.151 0 6.561 0 11.97a14.16 14.16 0 0 0 4.8 10.637 1.09 1.09 0 0 0 1.54-.096 1.09 1.09 0 0 0-.095-1.54 11.957 11.957 0 0 1-4.063-9 7.62 7.62 0 0 1 7.636-7.637 7.62 7.62 0 0 1 7.637 7.636 3.256 3.256 0 0 1-3.273 3.273 3.256 3.256 0 0 1-3.273-3.273 1.09 1.09 0 0 0-1.09-1.09 1.09 1.09 0 0 0-1.092 1.09c0 3 2.455 5.455 5.455 5.455s5.454-2.455 5.454-5.455c0-5.408-4.408-9.818-9.818-9.818z"/>
            </svg>
          </div>
          <span class="logo-text">KirinGo</span>
        </router-link>
      </div>

      <!-- 中间: 导航菜单胶囊 -->
      <div class="capsule nav-capsule">
        <nav class="desktop-nav">
          <router-link to="/" class="nav-link" active-class="active" @click="closeAll">首页</router-link>
          <router-link :to="isRecruiter ? '/recruiter/candidates' : '/jobs'" class="nav-link" active-class="active" @click="closeAll">
            {{ isRecruiter ? '找牛人' : '找工作' }}
          </router-link>
          <template v-if="isAuthenticated && isJobseeker">
            <router-link to="/resume" class="nav-link" active-class="active" @click="closeAll">简历优化</router-link>
            <router-link to="/interview" class="nav-link" active-class="active" @click="closeAll">AI 面试</router-link>
          </template>
          <template v-if="isAuthenticated && isRecruiter">
            <router-link to="/applications" class="nav-link" active-class="active" @click="closeAll">投递管理</router-link>
          </template>
          <router-link v-if="isAuthenticated" to="/chat" class="nav-link" active-class="active" @click="closeAll">
            {{ isRecruiter ? '沟通' : '消息' }}
            <template v-if="totalUnreadCount > 0">
              <span v-if="totalUnreadCount <= 9" class="badge-number">{{ totalUnreadCount }}</span>
              <span v-else class="badge-number">9+</span>
            </template>
          </router-link>
        </nav>
      </div>

      <!-- 右侧: 用户操作胶囊 -->
      <div class="capsule actions-capsule">
        <template v-if="isAuthenticated">
          <div class="user-menu-container">
            <div class="user-menu" :class="{ 'is-active': showMenu }" @click="toggleMenu">
              <AppAvatar :src="user?.avatar_url" :alt="user?.full_name || '用户头像'" size="sm" />
              <span class="user-name hidden-mobile">{{ user?.full_name || '用户' }}</span>
              <ChevronDownIcon class="icon-xs chevron-icon" :class="{ 'rotate': showMenu }" />
            </div>

            <!-- 下拉菜单 -->
            <transition name="dropdown">
              <div v-if="showMenu" class="dropdown-menu" @click.stop>
                <div class="dropdown-header">
                  <div class="dropdown-user-info">
                    <div class="dropdown-name-row">
                      <span class="dropdown-name">{{ user?.full_name }}</span>
                      <span class="role-badge" v-if="isJobseeker">求职者</span>
                      <span class="role-badge" v-if="isRecruiter">招聘者</span>
                    </div>
                    <span class="dropdown-email text-mono">{{ user?.email }}</span>
                  </div>
                </div>
                <div class="dropdown-content">
                  <router-link to="/profile" class="dropdown-item" @click="showMenu = false">
                    <UserIcon class="icon-sm" /> 个人中心
                  </router-link>
                  
                  <template v-if="isJobseeker">
                    <router-link to="/resume" class="dropdown-item" @click="showMenu = false">
                      <FileTextIcon class="icon-sm" /> 我的简历
                    </router-link>
                    <router-link to="/applications" class="dropdown-item" @click="showMenu = false">
                      <ClipboardListIcon class="icon-sm" /> 投递记录
                    </router-link>
                  </template>

                  <template v-if="isRecruiter">
                    <router-link to="/recruiter/candidates" class="dropdown-item" @click="showMenu = false">
                      <SearchIcon class="icon-sm" /> 牛人搜索
                    </router-link>
                    <router-link to="/recruiter/jobs" class="dropdown-item" @click="showMenu = false">
                      <BriefcaseIcon class="icon-sm" /> 职位管理
                    </router-link>
                    <router-link to="/recruiter/jobs/post" class="dropdown-item" @click="showMenu = false">
                      <PlusIcon class="icon-sm" /> 发布职位
                    </router-link>
                    <router-link to="/applications" class="dropdown-item" @click="showMenu = false">
                      <ClipboardListIcon class="icon-sm" /> 投递管理
                    </router-link>
                    <router-link to="/recruiter/company/settings" class="dropdown-item" @click="showMenu = false">
                      <SettingsIcon class="icon-sm" /> 公司设置
                    </router-link>
                  </template>

                  <div class="dropdown-divider"></div>
                  <div class="theme-selector">
                    <span class="theme-label text-mono">主题</span>
                    <div class="theme-buttons">
                      <button
                        class="theme-btn"
                        :class="{ active: themeStore.mode === 'auto' }"
                        @click="themeStore.setMode('auto')"
                      >
                        自动
                      </button>
                      <button
                        class="theme-btn"
                        :class="{ active: themeStore.mode === 'light' }"
                        @click="themeStore.setMode('light')"
                      >
                        浅色
                      </button>
                      <button
                        class="theme-btn"
                        :class="{ active: themeStore.mode === 'dark' }"
                        @click="themeStore.setMode('dark')"
                      >
                        深色
                      </button>
                    </div>
                  </div>
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item text-danger" @click="handleLogout">
                    <LogOutIcon class="icon-sm" /> 退出登录
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </template>
        <template v-else>
          <router-link to="/auth/login" class="btn-link" @click="closeAll">登录</router-link>
          <router-link to="/auth/register" class="btn-solid" @click="closeAll">注册</router-link>
        </template>

        <!-- 移动端汉堡菜单按钮 -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="菜单">
          <span class="mobile-menu-btn-line" :class="{ 'active': mobileMenuOpen }"></span>
          <span class="mobile-menu-btn-line" :class="{ 'active': mobileMenuOpen }"></span>
        </button>
      </div>
    </div>

    <!-- 移动端下拉导航 -->
    <transition name="mobile-menu">
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <nav class="mobile-nav">
          <router-link to="/" class="mobile-nav-item" @click="closeMobileMenu">首页</router-link>
          <router-link :to="isRecruiter ? '/recruiter/candidates' : '/jobs'" class="mobile-nav-item" @click="closeMobileMenu">
            {{ isRecruiter ? '找牛人' : '找工作' }}
          </router-link>
          <template v-if="isAuthenticated && isJobseeker">
            <router-link to="/resume" class="mobile-nav-item" @click="closeMobileMenu">简历优化</router-link>
            <router-link to="/interview" class="mobile-nav-item" @click="closeMobileMenu">AI 面试</router-link>
          </template>
          <router-link v-if="isAuthenticated" to="/chat" class="mobile-nav-item" @click="closeMobileMenu">
            {{ isRecruiter ? '沟通' : '消息' }}
            <template v-if="totalUnreadCount > 0">
              <span v-if="totalUnreadCount <= 9" class="badge-number mobile-badge-number">{{ totalUnreadCount }}</span>
              <span v-else class="badge-number mobile-badge-number">9+</span>
            </template>
          </router-link>
          <router-link v-if="isAuthenticated" to="/applications" class="mobile-nav-item" @click="closeMobileMenu">
            {{ isRecruiter ? '投递管理' : '投递记录' }}
          </router-link>
        </nav>
      </div>
    </transition>
  </header>

  <!-- 点击其他区域关闭菜单 -->
  <div v-if="showMenu || mobileMenuOpen" class="overlay" @click="closeAll"></div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useChatStore } from '@/stores/chat'
import AppAvatar from '@/components/AppAvatar.vue'
import {
  User as UserIcon,
  FileText as FileTextIcon,
  ClipboardList as ClipboardListIcon,
  LogOut as LogOutIcon,
  ChevronDown as ChevronDownIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Monitor as MonitorIcon,
  Settings as SettingsIcon,
  Briefcase as BriefcaseIcon,
  PlusCircle as PlusIcon,
  Search as SearchIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const chatStore = useChatStore()

const showMenu = ref(false)
const mobileMenuOpen = ref(false)
const scrolled = ref(false)

const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isJobseeker = computed(() => authStore.isJobseeker)
const isRecruiter = computed(() => authStore.isRecruiter)
const effectiveTheme = computed(() => themeStore.effectiveMode)

// 计算总未读数
const totalUnreadCount = computed(() => {
  if (!chatStore.conversations.length || !user.value) return 0
  if (isJobseeker.value) {
    return chatStore.conversations.reduce((sum, conv) => sum + conv.jobseeker_unread, 0)
  } else {
    return chatStore.conversations.reduce((sum, conv) => sum + conv.recruiter_unread, 0)
  }
})

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function closeAll() {
  showMenu.value = false
  mobileMenuOpen.value = false
}

function handleScroll() {
  scrolled.value = window.scrollY > 10
}

async function handleLogout() {
  closeAll()
  await authStore.signOut()
  router.push('/auth/login')
}

// 更新favicon颜色根据主题
function updateFavicon(theme: 'auto' | 'light' | 'dark') {
  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const iconColor = isDark ? '#ffffff' : '#26251e'

  // SVG内容和我们logo一致
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${iconColor}">
  <path d="M18.483 1.123a1.09 1.09 0 0 0-.752.362 1.09 1.09 0 0 0 .088 1.54 11.956 11.956 0 0 1 4 8.946 7.62 7.62 0 0 1-7.637 7.636 7.62 7.62 0 0 1-7.637-7.636 3.255 3.255 0 0 1 3.273-3.273c1.82 0 3.273 1.45 3.273 3.273a1.09 1.09 0 0 0 1.09 1.09 1.09 1.09 0 0 0 1.092-1.09c0-3-2.455-5.455-5.455-5.455s-5.454 2.455-5.454 5.455c0 5.408 4.408 9.818 9.818 9.818 5.41 0 9.818-4.41 9.818-9.818A14.16 14.16 0 0 0 19.272 1.4a1.09 1.09 0 0 0-.789-.277ZM9.818 2.15C4.408 2.151 0 6.561 0 11.97a14.16 14.16 0 0 0 4.8 10.637 1.09 1.09 0 0 0 1.54-.096 1.09 1.09 0 0 0-.095-1.54 11.957 11.957 0 0 1-4.063-9 7.62 7.62 0 0 1 7.636-7.637 7.62 7.62 0 0 1 7.637 7.636 3.256 3.256 0 0 1-3.273 3.273 3.256 3.256 0 0 1-3.273-3.273 1.09 1.09 0 0 0-1.09-1.09 1.09 1.09 0 0 0-1.092 1.09c0 3 2.455 5.455 5.455 5.455s5.454-2.455 5.454-5.455c0-5.408-4.408-9.818-9.818-9.818z"/>
</svg>
  `.trim()

  const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

  // 更新favicon link
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = url
}

// 应用主题到 html
watch(effectiveTheme, (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  // 更新favicon颜色
  updateFavicon(theme)
}, { immediate: true })

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 初始化主题
  if (effectiveTheme.value === 'dark') {
    document.documentElement.classList.add('dark')
  }
  // 获取会话列表更新未读数
  if (isAuthenticated.value) {
    chatStore.fetchConversations()
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 80px;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-bottom: none;
  transition: all 0.3s ease;
}

.app-header.is-scrolled {
  background: transparent;
  box-shadow: none;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* Liquid Glass Capsule Base */
.capsule {
  display: flex;
  align-items: center;
  background: color-mix(in srgb, var(--color-bg-canvas) 70%, transparent);
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  border: 1px solid color-mix(in srgb, var(--color-border) 25%, transparent);
  border-radius: 9999px;
  box-shadow: 0 20px 70px color-mix(in srgb, var(--color-text-primary) 10%, transparent);
  transition: all 0.3s ease;
}

.capsule:hover {
  border-color: color-mix(in srgb, var(--color-border) 40%, transparent);
  box-shadow: 0 24px 80px color-mix(in srgb, var(--color-text-primary) 12%, transparent);
}

/* Logo Capsule */
.logo-capsule {
  flex-shrink: 0;
  padding: 8px 16px 8px 8px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  white-space: nowrap;
}

.logo-icon {
  width: 28px;
  height: 28px;
  background: var(--color-text-primary);
  color: var(--color-bg-canvas);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.logo:hover .logo-icon {
  transform: scale(1.05);
  background: var(--color-primary);
}

.logo-text {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 400;
  color: var(--color-text-primary);
  letter-spacing: -0.11px;
}

/* Navigation Capsule */
.nav-capsule {
  flex: 0 1 auto;
  padding: 8px 12px;
  justify-content: center;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.nav-link {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.15s ease;
  padding: 8px 16px;
  white-space: nowrap;
  border-radius: 9999px;
  position: relative;
}

.nav-link:hover {
  background: color-mix(in srgb, var(--color-bg-surface-300) 70%, transparent);
  color: var(--color-error);
}

.nav-link.active {
  background: var(--color-bg-surface-300);
  color: var(--color-text-primary);
}

.badge-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: var(--color-primary);
  border-radius: 50%;
  vertical-align: top;
  margin-left: 6px;
  margin-top: 4px;
}

.badge-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background-color: var(--color-primary);
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 9999px;
  vertical-align: top;
  margin-left: 6px;
  margin-top: 2px;
  line-height: 1;
}

.mobile-badge-number {
  margin-left: 8px;
  margin-top: 0;
}

/* Actions Capsule */
.actions-capsule {
  flex-shrink: 0;
  padding: 8px 12px;
  gap: 12px;
}

.capsule-divider {
  width: 1px;
  height: 24px;
  background: color-mix(in srgb, var(--color-border) 25%, transparent);
}


.user-menu-container {
  position: relative;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px 4px 4px;
  border-radius: 9999px;
  transition: all 0.15s ease;
}

.user-menu:hover, .user-menu.is-active {
  background: color-mix(in srgb, var(--color-bg-surface-300) 70%, transparent);
}

/* Buttons in unauthenticated state */
.btn-link {
  padding: 8px 16px;
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: 9999px;
  transition: all 0.15s ease;
}

.btn-link:hover {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-bg-surface-300) 70%, transparent);
}

.btn-solid {
  padding: 8px 16px;
  font-family: var(--font-display);
  font-size: 14px;
  color: white;
  background: var(--color-primary);
  text-decoration: none;
  border-radius: 9999px;
  transition: all 0.15s ease;
}

.btn-solid:hover {
  background: var(--color-error);
  transform: scale(1.02);
}

.user-name {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-primary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron-icon {
  color: var(--color-text-tertiary);
  transition: transform 0.2s ease;
}

.chevron-icon.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 240px;
  background: var(--color-bg-surface-200);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-cursor-elevated);
  overflow: hidden;
  z-index: 200;
}

.dropdown-header {
  padding: 16px;
  background: var(--color-bg-surface-300);
  border-bottom: 1px solid var(--color-border);
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-name {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.role-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
  font-weight: 500;
}

.dropdown-email {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.dropdown-content {
  padding: 6px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-family: var(--font-display);
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  transition: all 0.15s;
}

.dropdown-item:hover {
  background: var(--color-bg-surface-300);
  color: var(--color-error);
}

.dropdown-item.text-danger {
  color: var(--color-error);
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 0;
}

/* Theme Selector */
.theme-selector {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.theme-label {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.theme-buttons {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  overflow: hidden;
  padding: 2px;
  background: var(--color-bg-surface-300);
}

.theme-btn {
  padding: 3px 10px;
  font-size: 12px;
  font-family: var(--font-display);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 9999px;
}

.theme-btn:hover {
  color: var(--color-error);
}

.theme-btn.active {
  background: var(--color-bg-canvas);
  color: var(--color-text-primary);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--color-text-primary) 15%, transparent);
}

/* Mobile Menu */
.mobile-menu-btn {
  display: none;
  width: 36px;
  height: 36px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: transparent;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mobile-menu-btn:hover {
  background: color-mix(in srgb, var(--color-bg-surface-300) 70%, transparent);
}

.mobile-menu-btn-line {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--color-text-primary);
  border-radius: 1px;
  transition: all 0.2s ease;
  transform-origin: center;
}

.mobile-menu-btn-line.active:nth-child(1) {
  transform: translateY(3.5px) rotate(45deg);
}

.mobile-menu-btn-line.active:nth-child(2) {
  transform: translateY(-3.5px) rotate(-45deg);
}

.mobile-menu {
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background: var(--color-bg-surface-200);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  z-index: 99;
}

.mobile-nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-family: var(--font-display);
  font-size: 15px;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.15s ease;
}

.mobile-nav-item:hover {
  background: var(--color-bg-surface-300);
  color: var(--color-text-primary);
}

.router-link-active.mobile-nav-item {
  color: var(--color-text-primary);
  background: var(--color-bg-surface-300);
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
}

/* Icon sizes */
.icon-xs { width: 12px; height: 12px; }
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 18px; height: 18px; }

.hidden-mobile {
  display: flex;
}

.hidden-desktop {
  display: none;
}

@media (max-width: 768px) {
  .hidden-desktop {
    display: flex;
  }
}

/* Transitions */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.mobile-menu-enter-active, .mobile-menu-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-menu-enter-from, .mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 900px) {
  .nav-capsule .desktop-nav {
    gap: 4px;
  }
  .nav-link {
    padding: 6px 12px;
    font-size: 13px;
  }
  .user-name {
    max-width: 60px;
  }
  .header-inner {
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .app-header {
    height: 72px;
  }

  .header-inner {
    padding: 12px 16px;
    gap: 12px;
  }

  .logo-capsule {
    padding: 6px 12px 6px 6px;
  }

  .nav-capsule {
    display: none;
  }

  .actions-capsule {
    padding: 6px 8px;
    gap: 8px;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-menu {
    top: 72px;
  }

  .hidden-mobile {
    display: none !important;
  }

  .capsule-divider {
    display: none;
  }

  .user-menu {
    padding: 2px;
  }

  .chevron-icon {
    display: none;
  }

  .logo-text {
    font-size: 16px;
  }

  .logo-icon {
    width: 26px;
    height: 26px;
  }
}
</style>
