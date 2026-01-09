import { BookOpen, Code2, Compass, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'

const actions = [
  {
    id: 'create',
    label: 'Create',
    icon: Sparkles,
  },
  {
    id: 'explore',
    label: 'Explore',
    icon: Compass,
  },
  {
    id: 'code',
    label: 'Code',
    icon: Code2,
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: BookOpen,
  },
]

export function ChatActions() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Button
            key={action.id}
            variant="secondary"
            className="gap-2"
            size="lg"
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
