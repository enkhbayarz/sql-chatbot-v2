import { createFileRoute } from '@tanstack/react-router'

import { SignupForm } from '@/components/auth/signup-form'

export const Route = createFileRoute('/auth/signup')({
  component: SignupPage,
})

function SignupPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <SignupForm />
    </div>
  )
}
