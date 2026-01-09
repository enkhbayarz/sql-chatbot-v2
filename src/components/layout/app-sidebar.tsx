import { LogOut, Menu, Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useChat } from '@/lib/chat-store'
import { useAuth } from '@/lib/auth-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// Mock data for chat history
const chatHistory = [
  {
    category: 'Yesterday',
    chats: [{ id: '1', title: 'Building a T3 Chatbot' }],
  },
  {
    category: 'Last 7 Days',
    chats: [
      { id: '2', title: 'Greeting Title' },
      { id: '3', title: 'AI Explained' },
    ],
  },
]

export function AppSidebar() {
  const { clearMessages } = useChat()
  const { user, logout } = useAuth()

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-4">
          <SidebarTrigger>
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <h1 className="text-lg font-semibold">T3.chat</h1>
        </div>
        <div className="px-2 pb-4">
          <Button
            variant="destructive"
            className="w-full"
            size="lg"
            onClick={clearMessages}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
        <div className="px-2 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search your threads..."
              className="pl-9 bg-sidebar-accent border-0"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="space-y-6 px-2 py-4">
          {chatHistory.map((section) => (
            <div key={section.category}>
              <h3 className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase">
                {section.category}
              </h3>
              <SidebarMenu>
                {section.chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton asChild>
                      <a
                        href="#"
                        className="text-sm hover:bg-sidebar-accent rounded-md"
                      >
                        {chat.title}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-4 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="lg"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
