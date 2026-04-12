// ============================================
// 认证状态管理
// ============================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { ensureProfile, fetchProfileById, isSupabaseConfigured } from '@/lib/database'
import type { Profile, UserRole } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<Profile | null>(null)
  const loading = ref(true)
  const initialized = ref(false)
  const isAuthenticated = computed(() => !!user.value)
  const isJobseeker = computed(() => user.value?.role === 'jobseeker')
  const isRecruiter = computed(() => user.value?.role === 'recruiter')
  let authSubscription: { unsubscribe: () => void } | null = null

  async function syncProfile(userId: string) {
    const profile = await fetchProfileById(userId)
    if (profile) {
      user.value = profile
      return profile
    }

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (authUser?.id === userId) {
      const created = await ensureProfile(authUser)
      user.value = created
      return created
    }

    return null
  }

  async function initialize() {
    if (initialized.value) {
      loading.value = false
      return
    }

    loading.value = true
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase 未配置，无法使用真实数据库')
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await syncProfile(session.user.id)
      }

      // Supabase 在 getSession 之后会立即触发一次 SIGNED_IN 事件，
      // 我们用标志跳过这次重复的 syncProfile，避免 UI 闪烁
      let initialEventSkipped = false

      if (!authSubscription) {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            // 跳过初始化后 Supabase 自动触发的第一次 SIGNED_IN
            if (!initialEventSkipped) {
              initialEventSkipped = true
              return
            }
            await syncProfile(session.user.id)
          } else if (event === 'SIGNED_OUT') {
            user.value = null
          } else if (event === 'USER_UPDATED' && session?.user) {
            await syncProfile(session.user.id)
          }
        })
        authSubscription = data.subscription
      }

      initialized.value = true
    } catch (error) {
      console.error('Auth initialization error:', error)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string, fullName: string, role: UserRole) {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase 未配置，无法注册') }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })

    if (!error && data.user && data.session) {
      await ensureProfile(data.user)
      await syncProfile(data.user.id)
    }

    return { data, error }
  }

  async function signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase 未配置，无法登录') }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error && data.user) {
      await syncProfile(data.user.id)
    }

    return { data, error }
  }

  async function signOut() {
    if (!isSupabaseConfigured) {
      user.value = null
      return
    }

    await supabase.auth.signOut()
    user.value = null
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user.value) return

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.value.id)

    if (!error) {
      user.value = { ...user.value, ...updates }
    }
    return { error }
  }

  async function resetPasswordForEmail(email: string) {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase 未配置，无法重置密码') }
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    return { data, error }
  }

  async function updatePassword(password: string) {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase 未配置，无法修改密码') }
    }

    const { data, error } = await supabase.auth.updateUser({
      password,
    })

    return { data, error }
  }

  return {
    user,
    loading,
    isAuthenticated,
    isJobseeker,
    isRecruiter,
    initialize,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPasswordForEmail,
    updatePassword,
  }
})
