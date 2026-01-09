import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

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
    <div className="group relative overflow-hidden rounded-lg border border-border/60 bg-muted/50 dark:bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 bg-muted dark:bg-[#2d2d2d] px-4 py-2.5">
        <span className="text-xs font-medium text-muted-foreground">
          {language.toUpperCase()}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs hover:bg-accent transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto p-4">
        <pre className="text-[13px] leading-6">
          <code className={`language-${language} text-foreground dark:text-[#d4d4d4]`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}
