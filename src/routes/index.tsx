import { createFileRoute } from '@tanstack/react-router'

import { ChatLayout } from '@/components/layout/chat-layout'
import { ChatWelcome } from '@/components/chat/chat-welcome'
import { ProtectedRoute } from '@/components/auth/protected-route'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <ProtectedRoute>
      <ChatLayout>
        <ChatWelcome />
      </ChatLayout>
    </ProtectedRoute>
  )
}
