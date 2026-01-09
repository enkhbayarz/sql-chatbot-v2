import { createFileRoute } from '@tanstack/react-router'

import { ChatLayout } from '@/components/layout/chat-layout'
import { ChatWelcome } from '@/components/chat/chat-welcome'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <ChatLayout>
      <ChatWelcome />
    </ChatLayout>
  )
}
