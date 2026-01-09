import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

/**
 * Get role by ID
 */
export const getRoleById = query({
  args: { roleId: v.string() },
  handler: async (ctx, args) => {
    // Search all roles to find one with matching ID
    const roles = await ctx.db.query('roles').collect()
    return roles.find((r) => r._id === args.roleId)
  },
})

/**
 * Get all roles
 */
export const getAllRoles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('roles').collect()
  },
})

/**
 * Get roles by IDs
 */
export const getRolesByIds = query({
  args: { roleIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const roles = await ctx.db.query('roles').collect()
    return roles.filter((r) => args.roleIds.includes(r._id))
  },
})

/**
 * Create a role
 */
export const createRole = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    priority: v.number(),
    permissions: v.array(
      v.object({
        type: v.literal('table'),
        resource: v.string(),
        action: v.union(v.literal('allow'), v.literal('deny')),
        conditions: v.optional(
          v.object({
            rowLimit: v.optional(v.number()),
            timeRestriction: v.optional(v.string()),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('roles', args)
  },
})
