import { createContext, use, useCallback, useMemo, useState } from 'react'

import type { ApiResponse, ChatMessage } from '@/types/chat'

interface ChatContextType {
  messages: Array<ChatMessage>
  isLoading: boolean
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Get JWT token from localStorage
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        throw new Error('Not authenticated. Please login.')
      }

      // Call API with JWT token
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

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content:
          response.status === 403
            ? '🔒 Access Denied'
            : data.error
              ? 'I encountered an error while processing your request.'
              : 'Here are the results of your query:',
        timestamp: new Date(),
        sql: data.sql,
        results: data.results || undefined,
        error: data.error || undefined,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      // Add error message
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: 'An error occurred while processing your request.',
        timestamp: new Date(),
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const value = useMemo(
    () => ({
      messages,
      isLoading,
      sendMessage,
      clearMessages,
    }),
    [messages, isLoading, sendMessage, clearMessages],
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
