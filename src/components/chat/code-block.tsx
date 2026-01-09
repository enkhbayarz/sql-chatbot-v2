import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language = 'sql' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-[#2d2d2d] px-4 py-2">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-7 gap-2 hover:bg-accent"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto p-4">
        <pre className="text-sm leading-relaxed">
          <code className={`language-${language} text-[#d4d4d4]`}>{code}</code>
        </pre>
      </div>
    </div>
  )
}
