import type { User, UserPermissions } from './types'
import { verifyJWT } from './jwt'
import { MOCK_USERS } from './mock-store'
import { PermissionResolver } from './permission-resolver'

/**
 * Auth Middleware
 * Wraps API handlers with authentication and authorization logic
 */

type AuthenticatedHandler = (
  request: Request,
  user: User,
  permissions: UserPermissions,
) => Promise<Response>

/**
 * Middleware to protect API routes with authentication
 * Extracts JWT, verifies it, loads user, resolves permissions
 */
export async function withAuth(
  request: Request,
  handler: AuthenticatedHandler,
): Promise<Response> {
  // Step 1: Extract JWT from Authorization header
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 },
    )
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  try {
    // Step 2: Verify JWT and decode payload
    const payload = await verifyJWT(token)

    // Step 3: Load user from store
    const user = MOCK_USERS.get(payload.userId)
    if (!user || !user.isActive) {
      return Response.json(
        { error: 'User not found or inactive' },
        { status: 401 },
      )
    }

    // Step 4: Resolve user permissions
    const permissions = PermissionResolver.resolvePermissions(user)

    // Step 5: Call the actual handler with user context
    return await handler(request, user, permissions)
  } catch (error) {
    // JWT verification failed (expired or invalid)
    return Response.json(
      { error: 'Authentication failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 401 },
    )
  }
}
