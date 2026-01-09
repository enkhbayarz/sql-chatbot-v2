import type { User, UserPermissions } from './types'
import { ALL_TABLES } from './convex-store'
import { getAllRoles, getAllDepartments } from './convex-store'

/**
 * Permission Resolver
 * Computes final table permissions for a user based on:
 * 1. Admin role → full access
 * 2. Department defaults
 * 3. Role permissions (sorted by priority)
 * 4. Rule: Explicit DENY > Explicit ALLOW
 */
export class PermissionResolver {
  /**
   * Resolve all permissions for a user
   */
  static async resolvePermissions(user: User): Promise<UserPermissions> {
    // Get roles and departments from Convex
    const rolesMap = await getAllRoles()
    const departmentsMap = await getAllDepartments()

    // Check if user is admin (bypass all permission checks)
    const roles = user.roleIds
      .map((id) => rolesMap.get(id))
      .filter((role) => role !== undefined)

    const isAdmin = roles.some((r) => r.name === 'Admin')

    if (isAdmin) {
      return {
        userId: user.id,
        allowedTables: new Set(ALL_TABLES),
        deniedTables: new Set(),
        maxRowLimit: Number.MAX_SAFE_INTEGER,
        isAdmin: true,
      }
    }

    const allowed = new Set<string>()
    const denied = new Set<string>()
    let maxRowLimit = 100 // Default row limit

    // Step 1: Add department default permissions
    const department = departmentsMap.get(user.departmentId)
    if (department) {
      if (department.allowedTables.includes('*')) {
        ALL_TABLES.forEach((t) => allowed.add(t))
      } else {
        department.allowedTables.forEach((t) => allowed.add(t))
      }
      department.deniedTables.forEach((t) => denied.add(t))
    }

    // Step 2: Apply role permissions (sorted by priority, highest first)
    const sortedRoles = roles.sort((a, b) => b.priority - a.priority)

    for (const role of sortedRoles) {
      for (const perm of role.permissions) {
        if (perm.type === 'table') {
          if (perm.resource === '*') {
            // Wildcard permission
            ALL_TABLES.forEach((t) => {
              if (perm.action === 'allow') {
                allowed.add(t)
              } else {
                denied.add(t)
              }
            })
          } else {
            // Specific table permission
            if (perm.action === 'allow') {
              allowed.add(perm.resource)
            } else {
              denied.add(perm.resource)
            }
          }

          // Update row limit if specified
          if (perm.conditions?.rowLimit) {
            maxRowLimit = Math.max(maxRowLimit, perm.conditions.rowLimit)
          }
        }
      }
    }

    // Step 3: Apply deny > allow rule
    // Remove any tables that are explicitly denied
    denied.forEach((table) => allowed.delete(table))

    return {
      userId: user.id,
      allowedTables: allowed,
      deniedTables: denied,
      maxRowLimit,
      isAdmin: false,
    }
  }

  /**
   * Check if user can access a specific table
   */
  static canAccessTable(
    permissions: UserPermissions,
    tableName: string,
  ): boolean {
    return permissions.allowedTables.has(tableName.toLowerCase())
  }

  /**
   * Check if user can access all tables in a list
   */
  static canAccessTables(
    permissions: UserPermissions,
    tableNames: Array<string>,
  ): { allowed: boolean; deniedTables: Array<string> } {
    const deniedTables = tableNames.filter(
      (table) => !permissions.allowedTables.has(table.toLowerCase()),
    )

    return {
      allowed: deniedTables.length === 0,
      deniedTables,
    }
  }
}
