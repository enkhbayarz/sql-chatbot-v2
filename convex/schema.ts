import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // User Management
  users: defineTable({
    email: v.string(),
    name: v.string(),
    roleIds: v.array(v.string()),
    departmentId: v.string(),
    isActive: v.boolean(),
    avatarUrl: v.optional(v.string()),
    preferences: v.object({
      theme: v.string(),
      notificationsEnabled: v.boolean(),
    }),
    createdAt: v.number(),
    passwordHash: v.optional(v.string()), // For password-based auth (temporary)
  }).index('by_email', ['email']),

  roles: defineTable({
    name: v.string(),
    description: v.string(),
    priority: v.number(),
    permissions: v.array(
      v.object({
        type: v.literal('table'),
        resource: v.string(), // table name or '*' for all
        action: v.union(v.literal('allow'), v.literal('deny')),
        conditions: v.optional(
          v.object({
            rowLimit: v.optional(v.number()),
            timeRestriction: v.optional(v.string()),
          }),
        ),
      }),
    ),
  }),

  departments: defineTable({
    name: v.string(),
    allowedTables: v.array(v.string()),
    deniedTables: v.array(v.string()),
  }),

  // Chat & Messaging
  conversations: defineTable({
    userId: v.id('users'),
    title: v.string(), // Auto-generated from first query
    createdAt: v.number(),
    lastMessageAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_last_message', ['lastMessageAt']),

  messages: defineTable({
    conversationId: v.id('conversations'),
    userId: v.id('users'),
    type: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    sql: v.optional(v.string()),
    resultCount: v.optional(v.number()),
    results: v.optional(v.array(v.any())), // Store limited results (max 100 rows)
    executionTimeMs: v.optional(v.number()),
    error: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index('by_conversation', ['conversationId'])
    .index('by_timestamp', ['timestamp']),
})
