import { LogOut, Menu, MoreVertical, Plus, Search, Trash2 } from 'lucide-react'
import { useQuery } from 'convex/react'
import { useState } from 'react'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useChat } from '@/lib/chat-store'
import { useAuth } from '@/lib/auth-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { api } from '../../../convex/_generated/api'

export function AppSidebar() {
  const {
    clearMessages,
    loadConversation,
    currentConversationId,
    deleteConversation,
  } = useChat()
  const { user, logout } = useAuth()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null)

  // Fetch conversations from Convex
  const conversations = useQuery(
    api.chat.getConversations,
    user?.id ? { userId: user.id as any } : 'skip',
  )

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Organize conversations by date
  const organizeConversations = () => {
    if (!conversations) return []

    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    const sevenDays = 7 * oneDay

    // Get start of today (midnight)
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    const todayStart = todayDate.getTime()

    // Get start of yesterday
    const yesterdayStart = todayStart - oneDay

    const today: typeof conversations = []
    const yesterday: typeof conversations = []
    const lastWeek: typeof conversations = []
    const older: typeof conversations = []

    conversations.forEach((conv) => {
      const messageTime = conv.lastMessageAt
      if (messageTime >= todayStart) {
        // Today
        today.push(conv)
      } else if (messageTime >= yesterdayStart) {
        // Yesterday
        yesterday.push(conv)
      } else if (now - messageTime < sevenDays) {
        // Last 7 days
        lastWeek.push(conv)
      } else {
        // Older
        older.push(conv)
      }
    })

    const result = []
    if (today.length > 0) {
      result.push({ category: 'Today', chats: today })
    }
    if (yesterday.length > 0) {
      result.push({ category: 'Yesterday', chats: yesterday })
    }
    if (lastWeek.length > 0) {
      result.push({ category: 'Last 7 Days', chats: lastWeek })
    }
    if (older.length > 0) {
      result.push({ category: 'Older', chats: older })
    }

    return result
  }

  const chatHistory = organizeConversations()

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
            className="w-full cursor-pointer transition-all hover:bg-destructive/90 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-destructive/20"
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
          {conversations === undefined ? (
            <div className="px-2 text-sm text-muted-foreground">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-2 text-sm text-muted-foreground">
              No conversations yet. Start a new chat!
            </div>
          ) : (
            chatHistory.map((section) => (
              <div key={section.category}>
                <h3 className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase">
                  {section.category}
                </h3>
                <SidebarMenu>
                  {section.chats.map((chat) => (
                    <SidebarMenuItem
                      key={chat._id}
                      className="group/menu-item relative"
                    >
                      <SidebarMenuButton
                        asChild
                        isActive={currentConversationId === chat._id}
                      >
                        <button
                          onClick={() => loadConversation(chat._id)}
                          className="text-sm hover:bg-sidebar-accent rounded-md w-full text-left pr-8 truncate overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                          title={chat.title}
                        >
                          {chat.title}
                        </button>
                      </SidebarMenuButton>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-sidebar-accent opacity-0 group-hover/menu-item:opacity-100 transition-opacity focus:opacity-100 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setConversationToDelete(chat._id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            ))
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full p-4 flex items-center gap-3 hover:bg-sidebar-accent transition-colors cursor-pointer">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Free plan
                  </p>
                </div>
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              className="w-64 mb-2"
            >
              <div className="px-3 py-2 border-b">
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer py-3"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-semibold">
              Delete chat
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              Are you sure you want to delete this chat?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 sm:justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setConversationToDelete(null)
              }}
              className="min-w-[80px]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (conversationToDelete) {
                  deleteConversation(conversationToDelete)
                  setDeleteDialogOpen(false)
                  setConversationToDelete(null)
                }
              }}
              className="min-w-[80px]"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}
