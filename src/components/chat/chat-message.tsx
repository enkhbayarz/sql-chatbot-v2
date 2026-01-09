import { Bot, Copy, User } from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ChatMessage } from '@/types/chat'

import { CodeBlock } from './code-block'
import { DataTable } from './data-table'

interface ChatMessageProps {
  message: ChatMessage
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const copyMessage = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`group border-b border-border/40 ${
        message.type === 'user' ? 'bg-background' : 'bg-muted/30'
      }`}
    >
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex gap-6">
          {/* Avatar */}
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              message.type === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-sidebar text-sidebar-foreground border border-border'
            }`}
          >
            {message.type === 'user' ? (
              <User className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4 min-w-0">
            {/* User message or assistant response text */}
            {message.content && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-[15px] leading-7 whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            )}

            {/* SQL Query */}
            {message.sql && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Generated SQL
                </div>
                <CodeBlock code={message.sql} language="sql" />
              </div>
            )}

            {/* Error */}
            {message.error && (
              <Alert variant="destructive" className="border-destructive/50">
                <AlertDescription className="text-sm">
                  {message.error.includes('Access denied') ||
                  message.error.includes('🔒')
                    ? `🔒 ${message.error.replace('🔒', '').trim()}`
                    : message.error}
                </AlertDescription>
              </Alert>
            )}

            {/* Query Results */}
            {message.results && message.results.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">
                  Results ({message.results.length} rows)
                </div>
                <DataTable data={message.results} />
              </div>
            )}

            {/* Copy button - show on hover for assistant messages */}
            {message.type === 'assistant' && message.content && (
              <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={copyMessage}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md hover:bg-muted border border-border transition-colors cursor-pointer"
                  title="Copy message"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
