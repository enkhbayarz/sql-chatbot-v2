import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useChat } from '@/lib/chat-store'

import { ChatActions } from './chat-actions'
import { ChatMessageComponent } from './chat-message'

const sampleQuestions = [
  'Show me all accounts',
  'What are the top 5 districts by population?',
  'List all credit transactions',
  'Show me accounts with loans',
]

export function ChatWelcome() {
  const { messages, sendMessage } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSampleQuestion = (question: string) => {
    sendMessage(question)
  }

  // Show chat messages if there are any
  if (messages.length > 0) {
    return (
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1">
          {messages.map((message) => (
            <ChatMessageComponent key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    )
  }

  // Show welcome screen if no messages
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-12">
        <div className="space-y-8 text-center">
          <h1 className="text-5xl font-bold">How can I help you?</h1>

          <ChatActions />

          <div className="space-y-3 text-left">
            {sampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSampleQuestion(question)}
                className="w-full rounded-lg border border-border bg-card px-6 py-4 text-left text-sm hover:bg-accent transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <Alert className="bg-yellow-900/20 border-yellow-900/50 text-yellow-200">
          <AlertDescription className="flex items-center justify-between">
            <span>
              Connected to <span className="font-semibold">MySQL</span> banking
              database.{' '}
              <span className="text-yellow-100">
                Ask questions in natural language!
              </span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 hover:bg-yellow-900/30"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
