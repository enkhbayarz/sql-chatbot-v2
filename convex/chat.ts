import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

/**
 * Create a new conversation
 */
export const createConversation = mutation({
  args: {
    userId: v.id('users'),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert('conversations', {
      userId: args.userId,
      title: args.title,
      createdAt: now,
      lastMessageAt: now,
    })
  },
})

/**
 * Get all conversations for a user, ordered by last message time
 */
export const getConversations = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('conversations')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect()
  },
})

/**
 * Get a single conversation by ID
 */
export const getConversation = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId)
  },
})

/**
 * Update conversation title
 */
export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id('conversations'),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      title: args.title,
    })
  },
})

/**
 * Update conversation last message time
 */
export const updateConversationLastMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    })
  },
})

/**
 * Send a message (create message in conversation)
 */
export const sendMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    userId: v.id('users'),
    type: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    sql: v.optional(v.string()),
    resultCount: v.optional(v.number()),
    results: v.optional(v.array(v.any())), // Limited results (max 100 rows)
    executionTimeMs: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { conversationId, ...messageData } = args

    // Insert message
    await ctx.db.insert('messages', {
      conversationId,
      ...messageData,
      timestamp: Date.now(),
    })

    // Update conversation last message time
    await ctx.db.patch(conversationId, {
      lastMessageAt: Date.now(),
    })
  },
})

/**
 * Get all messages for a conversation, ordered by timestamp
 */
export const getMessages = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId),
      )
      .order('asc')
      .collect()
  },
})

/**
 * Delete a conversation and all its messages
 */
export const deleteConversation = mutation({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    // Delete all messages in the conversation
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId),
      )
      .collect()

    for (const message of messages) {
      await ctx.db.delete(message._id)
    }

    // Delete the conversation
    await ctx.db.delete(args.conversationId)
  },
})
