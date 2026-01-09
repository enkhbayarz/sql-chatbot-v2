export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sql?: string
  results?: Array<Record<string, any>>
  error?: string
}

export interface ApiResponse {
  sql: string
  results: Array<Record<string, any>> | null
  error: string | null
}
