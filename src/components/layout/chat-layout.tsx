import { ChatHeader } from '@/components/chat/chat-header'
import { ChatInput } from '@/components/chat/chat-input'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ChatProvider } from '@/lib/chat-store'

interface ChatLayoutProps {
  children: React.ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <ChatProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <ChatHeader />
            <main className="flex flex-1 flex-col overflow-hidden">
              {children}
            </main>
            <ChatInput />
          </div>
        </div>
      </SidebarProvider>
    </ChatProvider>
  )
}
