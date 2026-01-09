import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

/**
 * Get user by email
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()
  },
})

/**
 * Get user by ID
 */
export const getUserById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId)
  },
})

/**
 * Create a new user
 */
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    roleIds: v.array(v.string()),
    departmentId: v.string(),
    passwordHash: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        theme: v.string(),
        notificationsEnabled: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()

    if (existing) {
      throw new Error('User with this email already exists')
    }

    return await ctx.db.insert('users', {
      email: args.email,
      name: args.name,
      roleIds: args.roleIds,
      departmentId: args.departmentId,
      isActive: true,
      avatarUrl: undefined,
      preferences: args.preferences || {
        theme: 'dark',
        notificationsEnabled: true,
      },
      createdAt: Date.now(),
      passwordHash: args.passwordHash,
    })
  },
})

/**
 * Update user
 */
export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    name: v.optional(v.string()),
    roleIds: v.optional(v.array(v.string())),
    departmentId: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    preferences: v.optional(
      v.object({
        theme: v.string(),
        notificationsEnabled: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args
    const user = await ctx.db.get(userId)
    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.patch(userId, updates)
  },
})

/**
 * Get all users (for admin)
 */
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
  },
})
