import { createContext, use, useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'

import type { ApiResponse, ChatMessage } from '@/types/chat'
import { useAuth } from './auth-context'
import { api } from '../../convex/_generated/api'

interface ChatContextType {
  messages: Array<ChatMessage>
  isLoading: boolean
  currentConversationId: string | null
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
  createNewConversation: () => Promise<void>
  loadConversation: (conversationId: string) => Promise<void>
  deleteConversation: (conversationId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)

  // Convex mutations
  const createConversation = useMutation(api.chat.createConversation)
  const sendMessageToConvex = useMutation(api.chat.sendMessage)
  const updateConversationTitle = useMutation(api.chat.updateConversationTitle)
  const deleteConversationMutation = useMutation(api.chat.deleteConversation)

  // Load messages for current conversation
  const convexMessages = useQuery(
    api.chat.getMessages,
    currentConversationId
      ? { conversationId: currentConversationId as any }
      : 'skip',
  )

  // Convert Convex messages to ChatMessage format
  const messages: Array<ChatMessage> = useMemo(() => {
    if (!convexMessages) return []
    return convexMessages.map((msg) => ({
      id: msg._id,
      type: msg.type,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      sql: msg.sql,
      results: msg.results && msg.results.length > 0 ? msg.results : undefined,
      error: msg.error,
    }))
  }, [convexMessages])

  // Create a new conversation
  const createNewConversation = useCallback(async () => {
    if (!user?.id) {
      throw new Error('Not authenticated. Please login.')
    }

    const conversationId = await createConversation({
      userId: user.id as any,
      title: 'New Chat',
    })

    setCurrentConversationId(conversationId)
  }, [user, createConversation])

  // Load a conversation
  const loadConversation = useCallback(async (conversationId: string) => {
    setCurrentConversationId(conversationId)
  }, [])

  // Initialize: create a new conversation if none exists
  // useEffect(() => {
  //   if (user?.id && !currentConversationId) {
  //     createNewConversation().catch(console.error)
  //   }
  // }, [user?.id, currentConversationId, createNewConversation])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user?.id) {
        throw new Error('Not authenticated. Please login.')
      }

      // Ensure we have a conversation
      let conversationId = currentConversationId
      if (!conversationId) {
        conversationId = await createConversation({
          userId: user.id as any,
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        })
        setCurrentConversationId(conversationId)
      }

      setIsLoading(true)

      try {
        // Save user message to Convex
        await sendMessageToConvex({
          conversationId: conversationId as any,
          userId: user.id as any,
          type: 'user',
          content,
        })

        // Get JWT token from localStorage
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('auth_token')
            : null
        if (!token) {
          throw new Error('Not authenticated. Please login.')
        }

        // Call API with JWT token
        const startTime = Date.now()
        const response = await fetch('/api/sql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt: content }),
        })

        // Handle authentication errors
        if (response.status === 401) {
          // Token expired or invalid - redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            window.location.href = '/auth/login'
          }
          return
        }

        const data: ApiResponse = await response.json()
        const executionTime = Date.now() - startTime

        // Limit results to 100 rows to avoid huge storage costs
        const limitedResults = data.results
          ? data.results.slice(0, 100)
          : undefined

        // Save assistant response to Convex
        await sendMessageToConvex({
          conversationId: conversationId as any,
          userId: user.id as any,
          type: 'assistant',
          content:
            response.status === 403
              ? '🔒 Access Denied'
              : data.error
                ? 'I encountered an error while processing your request.'
                : 'Here are the results of your query:',
          sql: data.sql || undefined,
          resultCount: data.results?.length || undefined,
          results: limitedResults,
          executionTimeMs: executionTime,
          error: data.error || undefined,
        })

        // Update conversation title from first message if it's still "New Chat"
        // We'll update it optimistically - the query will refetch and show the updated title
        if (conversationId) {
          await updateConversationTitle({
            conversationId: conversationId as any,
            title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          })
        }
      } catch (error) {
        // Save error message to Convex
        if (conversationId) {
          await sendMessageToConvex({
            conversationId: conversationId as any,
            userId: user.id as any,
            type: 'assistant',
            content: 'An error occurred while processing your request.',
            error:
              error instanceof Error ? error.message : 'Unknown error occurred',
          })
        }
      } finally {
        setIsLoading(false)
      }
    },
    [
      user,
      currentConversationId,
      createConversation,
      sendMessageToConvex,
      updateConversationTitle,
    ],
  )

  const clearMessages = useCallback(async () => {
    // Check if current conversation has messages
    const hasMessages =
      messages.length > 0 || (convexMessages && convexMessages.length > 0)

    if (hasMessages) {
      // Current conversation has messages, create a new one
      await createNewConversation()
    } else if (!currentConversationId) {
      // No current conversation, create one
      await createNewConversation()
    }
    // If current conversation is empty, do nothing - just keep using it
    // This prevents creating multiple empty "New Chat" conversations
  }, [messages, convexMessages, currentConversationId, createNewConversation])

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      await deleteConversationMutation({
        conversationId: conversationId as any,
      })

      // If we deleted the current conversation, create a new one
      if (currentConversationId === conversationId) {
        await createNewConversation()
      }
    },
    [deleteConversationMutation, currentConversationId, createNewConversation],
  )

  const value = useMemo(
    () => ({
      messages,
      isLoading,
      currentConversationId,
      sendMessage,
      clearMessages,
      createNewConversation,
      loadConversation,
      deleteConversation,
    }),
    [
      messages,
      isLoading,
      currentConversationId,
      sendMessage,
      clearMessages,
      createNewConversation,
      loadConversation,
      deleteConversation,
    ],
  )

  return <ChatContext value={value}>{children}</ChatContext>
}

export function useChat() {
  const context = use(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
