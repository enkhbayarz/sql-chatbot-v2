import { createFileRoute } from '@tanstack/react-router'

import { LoginForm } from '@/components/auth/login-form'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <LoginForm />
    </div>
  )
}
