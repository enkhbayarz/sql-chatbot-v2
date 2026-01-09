import { Bot, User } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ChatMessage } from '@/types/chat'

import { CodeBlock } from './code-block'
import { DataTable } from './data-table'

interface ChatMessageProps {
  message: ChatMessage
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  return (
    <div className="flex gap-4 px-6 py-8">
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          message.type === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        {message.type === 'user' ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4">
        {/* User message or assistant response text */}
        {message.content && (
          <div className="text-sm leading-relaxed">{message.content}</div>
        )}

        {/* SQL Query */}
        {message.sql && <CodeBlock code={message.sql} language="sql" />}

        {/* Error */}
        {message.error && (
          <Alert variant="destructive">
            <AlertDescription>{message.error}</AlertDescription>
          </Alert>
        )}

        {/* Query Results */}
        {message.results && message.results.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              Query Results
            </div>
            <DataTable data={message.results} />
          </div>
        )}
      </div>
    </div>
  )
}
