import { createFileRoute } from '@tanstack/react-router'
import { convex } from '@/lib/convex-client'
import { signJWT } from '@/lib/auth/jwt'
import { api } from 'convex/_generated/api'

export const Route = createFileRoute('/api/auth/signup')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { email, password, name, roleIds, departmentId } =
            await request.json()

          if (!email || !password || !name || !roleIds || !departmentId) {
            return Response.json(
              { error: 'All fields are required' },
              { status: 400 },
            )
          }

          // Check if user already exists
          const existingUser = await convex.query(api.users.getUserByEmail, {
            email,
          })

          if (existingUser) {
            return Response.json(
              { error: 'User with this email already exists' },
              { status: 409 },
            )
          }

          // Create user in Convex
          // Note: In production, password should be hashed (bcrypt, etc.)
          const userId = await convex.mutation(api.users.createUser, {
            email,
            name,
            roleIds: Array.isArray(roleIds) ? roleIds : [roleIds],
            departmentId,
            passwordHash: password, // Temporary - should hash password
          })

          // Generate JWT token
          const user = await convex.query(api.users.getUserById, {
            userId: userId as any,
          })

          if (!user) {
            return Response.json(
              { error: 'Failed to create user' },
              { status: 500 },
            )
          }

          const token = await signJWT({
            userId: user._id,
            email: user.email,
            roleIds: user.roleIds,
            departmentId: user.departmentId,
          })

          // Also store password in MOCK_CREDENTIALS for now (temporary)
          // In production, this should use proper password hashing
          if (
            typeof globalThis !== 'undefined' &&
            (globalThis as any).MOCK_CREDENTIALS
          ) {
            ;(globalThis as any).MOCK_CREDENTIALS.set(email, password)
          }

          return Response.json({
            token,
            user: {
              id: user._id,
              email: user.email,
              name: user.name,
            },
          })
        } catch (error) {
          console.error('Signup error:', error)
          return Response.json(
            {
              error:
                'Signup failed: ' +
                (error instanceof Error ? error.message : 'Unknown error'),
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
