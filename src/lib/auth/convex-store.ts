import { convex } from '@/lib/convex-client'
import type { User, Role, Department } from './types'
import { api } from 'convex/_generated/api'

// All available tables in the banking database
export const ALL_TABLES = [
  'district',
  'account',
  'client',
  'disp',
  'trans',
  'loan',
  'card',
  'order',
]

/**
 * Convex-based user store
 * Replaces mock-store.ts with Convex backend
 */

// Mock credentials (temporary - will be replaced with proper auth)
// This stores passwords for users created via signup
export const MOCK_CREDENTIALS: Map<string, string> = new Map([
  ['admin@bank.com', 'admin123'],
  ['hr.senior@bank.com', 'hr123'],
  ['hr.junior@bank.com', 'hr123'],
  ['finance@bank.com', 'finance123'],
])

/**
 * Add credentials for a new user (temporary)
 */
export function addCredentials(email: string, password: string) {
  MOCK_CREDENTIALS.set(email, password)
}

/**
 * Get user by email from Convex
 */
export async function findUserByEmail(
  email: string,
): Promise<User | undefined> {
  try {
    const user = await convex.query(api.users.getUserByEmail, { email })
    if (!user) return undefined

    // Convert Convex user to our User type
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      roleIds: user.roleIds,
      departmentId: user.departmentId,
      createdAt: new Date(user.createdAt),
      isActive: user.isActive,
    }
  } catch (error) {
    console.error('Error fetching user from Convex:', error)
    return undefined
  }
}

/**
 * Get user by ID from Convex
 */
export async function getUserById(userId: string): Promise<User | undefined> {
  try {
    const user = await convex.query(api.users.getUserById, {
      userId: userId as any,
    })
    if (!user) return undefined

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      roleIds: user.roleIds,
      departmentId: user.departmentId,
      createdAt: new Date(user.createdAt),
      isActive: user.isActive,
    }
  } catch (error) {
    console.error('Error fetching user from Convex:', error)
    return undefined
  }
}

/**
 * Validate credentials (temporary - will use proper auth later)
 */
export async function validateCredentials(
  email: string,
  password: string,
): Promise<User | null> {
  const storedPassword = MOCK_CREDENTIALS.get(email)
  if (!storedPassword || storedPassword !== password) {
    return null
  }

  const user = await findUserByEmail(email)
  return user || null
}

/**
 * Get all roles from Convex
 */
export async function getAllRoles(): Promise<Map<string, Role>> {
  try {
    const roles = await convex.query(api.roles.getAllRoles, {})
    const rolesMap = new Map<string, Role>()

    for (const role of roles) {
      rolesMap.set(role._id, {
        id: role._id,
        name: role.name,
        description: role.description,
        priority: role.priority,
        permissions: role.permissions,
      })
    }

    return rolesMap
  } catch (error) {
    console.error('Error fetching roles from Convex:', error)
    return new Map()
  }
}

/**
 * Get all departments from Convex
 */
export async function getAllDepartments(): Promise<Map<string, Department>> {
  try {
    const departments = await convex.query(
      api.departments.getAllDepartments,
      {},
    )
    const departmentsMap = new Map<string, Department>()

    for (const dept of departments) {
      departmentsMap.set(dept._id, {
        id: dept._id,
        name: dept.name,
        allowedTables: dept.allowedTables,
        deniedTables: dept.deniedTables,
      })
    }

    return departmentsMap
  } catch (error) {
    console.error('Error fetching departments from Convex:', error)
    return new Map()
  }
}
