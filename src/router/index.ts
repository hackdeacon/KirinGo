// ============================================
// 路由配置
// ============================================
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    // 认证页面
    {
      path: '/auth/login',
      name: 'Login',
      component: () => import('@/pages/auth/LoginPage.vue'),
      meta: { guest: true, title: '登录' },
    },
    {
      path: '/auth/register',
      name: 'Register',
      component: () => import('@/pages/auth/RegisterPage.vue'),
      meta: { guest: true, title: '注册' },
    },
    {
      path: '/auth/forgot-password',
      name: 'ForgotPassword',
      component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
      meta: { guest: true, title: '找回密码' },
    },
    {
      path: '/auth/reset-password',
      name: 'ResetPassword',
      component: () => import('@/pages/auth/ResetPasswordPage.vue'),
      meta: { title: '重置密码' },
    },

    // 首页
    {
      path: '/',
      name: 'Home',
      component: () => import('@/pages/HomePage.vue'),
      meta: { keepAlive: true, title: '首页' },
    },

    // 职位
    {
      path: '/jobs',
      name: 'Jobs',
      component: () => import('@/pages/jobs/JobListPage.vue'),
      meta: { keepAlive: true, title: '职位搜索' },
    },
    {
      path: '/jobs/:id',
      name: 'JobDetail',
      component: () => import('@/pages/jobs/JobDetailPage.vue'),
      meta: { title: '职位详情' },
    },

    // 简历
    {
      path: '/resume',
      name: 'Resume',
      component: () => import('@/pages/resume/ResumePage.vue'),
      meta: { requiresAuth: true, keepAlive: true, title: '我的简历' },
    },
    {
      path: '/resume/view/:userId',
      name: 'ResumeView',
      component: () => import('@/pages/resume/ResumePage.vue'),
      meta: { requiresAuth: true, title: '候选人简历' },
    },
    {
      path: '/resume/ai-optimize',
      name: 'AIOptimize',
      component: () => import('@/pages/resume/AIOptimizePage.vue'),
      meta: { requiresAuth: true, keepAlive: true, title: 'AI 简历深度优化' },
    },

    // AI 模拟面试
    {
      path: '/interview',
      name: 'Interview',
      component: () => import('@/pages/interview/InterviewPage.vue'),
      meta: { requiresAuth: true, keepAlive: true, title: 'AI 模拟面试' },
    },

    // 聊天
    {
      path: '/chat',
      name: 'ChatList',
      component: () => import('@/pages/chat/ChatRoomPage.vue'),
      meta: { requiresAuth: true, keepAlive: true, title: '消息沟通' },
      beforeEnter: async (to, _from, next) => {
        const chatStore = useChatStore()
        const authStore = useAuthStore()
        
        // 确保已登录
        if (!authStore.isAuthenticated) {
          next()
          return
        }

        // 预加载会话列表
        if (chatStore.conversations.length === 0) {
          await chatStore.fetchConversations()
        }

        // 如果有会话且当前没有 ID，自动重定向到第一个会话
        if (chatStore.conversations.length > 0 && !to.params.id) {
          next({ name: 'ChatRoom', params: { id: chatStore.conversations[0].id } })
        } else {
          next()
        }
      }
    },
    {
      path: '/chat/:id',
      name: 'ChatRoom',
      component: () => import('@/pages/chat/ChatRoomPage.vue'),
      meta: { requiresAuth: true, title: '消息会话' },
    },

    // 投递记录
    {
      path: '/applications',
      name: 'Applications',
      component: () => import('@/pages/ApplicationsPage.vue'),
      meta: { requiresAuth: true, keepAlive: true, title: '投递管理' },
    },

    // 个人中心
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/pages/ProfilePage.vue'),
      meta: { requiresAuth: true, keepAlive: true, title: '个人中心' },
    },

    // 招聘方管理
    {
      path: '/recruiter/jobs',
      name: 'JobManagement',
      component: () => import('@/pages/recruiter/JobManagementPage.vue'),
      meta: { requiresAuth: true, role: 'recruiter', keepAlive: true, title: '职位管理' },
    },
    {
      path: '/recruiter/candidates',
      name: 'CandidateSearch',
      component: () => import('@/pages/recruiter/CandidateSearchPage.vue'),
      meta: { requiresAuth: true, role: 'recruiter', keepAlive: true, title: '牛人搜索' },
    },
    {
      path: '/recruiter/jobs/post',
      name: 'PostJob',
      component: () => import('@/pages/recruiter/PostJobPage.vue'),
      meta: { requiresAuth: true, role: 'recruiter', title: '发布职位' },
    },
    {
      path: '/recruiter/jobs/edit/:id',
      name: 'EditJob',
      component: () => import('@/pages/recruiter/PostJobPage.vue'),
      meta: { requiresAuth: true, role: 'recruiter', title: '编辑职位' },
    },
    {
      path: '/recruiter/company/settings',
      name: 'CompanySettings',
      component: () => import('@/pages/recruiter/CompanySettingsPage.vue'),
      meta: { requiresAuth: true, role: 'recruiter', keepAlive: true, title: '公司设置' },
    },

    // 静态内容页面
    {
      path: '/about',
      name: 'About',
      component: () => import('@/pages/ContentPage.vue'),
      meta: { title: '关于我们' },
    },
    {
      path: '/careers',
      name: 'Careers',
      component: () => import('@/pages/ContentPage.vue'),
      meta: { title: '加入我们' },
    },
    {
      path: '/privacy',
      name: 'Privacy',
      component: () => import('@/pages/ContentPage.vue'),
      meta: { title: '隐私协议' },
    },
    {
      path: '/terms',
      name: 'Terms',
      component: () => import('@/pages/ContentPage.vue'),
      meta: { title: '服务条款' },
    },
    {
      path: '/docs/:id',
      name: 'Docs',
      component: () => import('@/pages/ContentPage.vue'),
      meta: { title: '文档中心' },
    },

    // 404
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // 需要认证的页面
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 已登录用户不能访问登录/注册页
  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'Home' })
    return
  }

  // 角色权限检查
  if (to.meta.role && authStore.user?.role !== to.meta.role) {
    next({ name: 'Home' })
    return
  }

  next()
})

// 动态网页标题
router.afterEach((to) => {
  const baseTitle = 'KirinGo 麒麟智聘'
  const pageTitle = to.meta?.title as string | undefined
  if (pageTitle) {
    if (pageTitle === '首页') {
      document.title = `${baseTitle} - AI 智能招聘平台`
    } else {
      document.title = `${pageTitle} · ${baseTitle}`
    }
  } else {
    document.title = `${baseTitle} - AI 智能招聘平台`
  }
})

export default router

