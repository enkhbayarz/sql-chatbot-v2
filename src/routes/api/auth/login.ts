import { createFileRoute } from '@tanstack/react-router'

import { signJWT } from '@/lib/auth/jwt'
import { validateCredentials } from '@/lib/auth/mock-store'

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { email, password } = await request.json()

          if (!email || !password) {
            return Response.json(
              { error: 'Email and password are required' },
              { status: 400 },
            )
          }

          // Validate credentials against mock store
          const user = validateCredentials(email, password)

          if (!user) {
            return Response.json(
              { error: 'Invalid email or password' },
              { status: 401 },
            )
          }

          // Generate JWT token (1 hour expiration)
          const token = await signJWT({
            userId: user.id,
            email: user.email,
            roleIds: user.roleIds,
            departmentId: user.departmentId,
          })

          // Return token and user info
          return Response.json({
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
          })
        } catch (error) {
          return Response.json(
            { error: 'Login failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 },
          )
        }
      },
    },
  },
})
