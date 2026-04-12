// ============================================
// 聊天状态管理
// ============================================
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import {
  fetchConversations as loadConversations,
  fetchMessages as loadMessages,
  markConversationRead,
  sendConversationMessage,
} from '@/lib/database'
import type { Conversation, Message } from '@/types'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const messagesCache = ref<Record<string, Message[]>>({})
  const loading = ref(false)
  const error = ref('')

  async function fetchConversations() {
    loading.value = true
    try {
      const authStore = useAuthStore()
      const userId = authStore.user?.id
      if (!userId) return

      error.value = ''
      conversations.value = await loadConversations(userId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '会话加载失败'
      conversations.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchMessages(conversationId: string) {
    const authStore = useAuthStore()
    if (!authStore.user) return

    // 优先从缓存加载，实现 SWR 策略
    if (messagesCache.value[conversationId]) {
      messages.value = [...messagesCache.value[conversationId]]
    } else {
      messages.value = []
    }

    try {
      error.value = ''
      const fetchedMessages = await loadMessages(conversationId)
      
      // 更新缓存和当前列表
      messagesCache.value[conversationId] = fetchedMessages
      messages.value = fetchedMessages
      
      currentConversation.value = conversations.value.find(c => c.id === conversationId) || null
      if (currentConversation.value) {
        await markConversationRead(conversationId, authStore.user.role)
        if (authStore.user.role === 'recruiter') {
          currentConversation.value.recruiter_unread = 0
        } else {
          currentConversation.value.jobseeker_unread = 0
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '消息加载失败'
      messages.value = []
    }
  }

  async function sendMessage(conversationId: string, content: string) {
    const authStore = useAuthStore()
    const senderId = authStore.user?.id
    const senderRole = authStore.user?.role
    if (!senderId || !senderRole) return

    const conversation = conversations.value.find(c => c.id === conversationId)
    if (!conversation) {
      return
    }

    try {
      error.value = ''
      const newMessage = await sendConversationMessage({
        conversation,
        senderId,
        senderRole,
        content,
      })

      if (!messages.value.some(message => message.id === newMessage.id)) {
        messages.value.push(newMessage)
        // 同步更新缓存
        if (messagesCache.value[conversationId]) {
          messagesCache.value[conversationId] = [...messages.value]
        }
      }
      conversation.last_message = content
      conversation.last_message_at = newMessage.created_at

      if (senderRole === 'recruiter') {
        conversation.recruiter_unread = 0
        conversation.jobseeker_unread += 1
      } else {
        conversation.jobseeker_unread = 0
        conversation.recruiter_unread += 1
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发送消息失败'
    }
  }

  function subscribeToMessages(conversationId: string) {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as Message
          if (!messages.value.some(message => message.id === incoming.id)) {
            messages.value.push(incoming)
            // 同步更新缓存
            if (messagesCache.value[conversationId]) {
              messagesCache.value[conversationId] = [...messages.value]
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    subscribeToMessages,
  }
})
