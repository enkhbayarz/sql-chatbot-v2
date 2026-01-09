# Convex Integration Guide

## 🎯 **Perfect Use Cases for Convex in Your SQL Chatbot**

---

## ✅ **What Convex SHOULD Handle** (Application Data)

### **1. User Management** 👥

**Replace:** Mock users in `src/lib/auth/mock-store.ts`
**Convex Handles:**

- User profiles (name, email, role)
- User authentication (built-in Convex Auth)
- User permissions (stored in Convex)
- User preferences (theme, settings)

**Schema:**

```typescript
// convex/schema.ts
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
}).index("by_email", ["email"]),
```

---

### **2. Chat History** 💬

**Replace:** Lost messages (currently stored nowhere)
**Convex Handles:**

- All chat conversations
- User messages
- Assistant responses
- SQL queries generated
- Query results (cached)

**Schema:**

```typescript
conversations: defineTable({
  userId: v.id("users"),
  title: v.string(), // Auto-generated from first query
  createdAt: v.number(),
  lastMessageAt: v.number(),
}).index("by_user", ["userId"]),

messages: defineTable({
  conversationId: v.id("conversations"),
  userId: v.id("users"),
  type: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
  sql: v.optional(v.string()),
  resultCount: v.optional(v.number()),
  executionTimeMs: v.optional(v.number()),
  error: v.optional(v.string()),
  timestamp: v.number(),
}).index("by_conversation", ["conversationId"]),
```

**Benefits:**

- ✅ Messages persist forever
- ✅ Access chat history from any device
- ✅ Search through old queries
- ✅ Real-time sync across tabs

---

### **3. Query Favorites** ⭐

**New Feature!**
**Convex Handles:**

- Save frequently used queries
- Organize by tags/categories
- Share with team members

**Schema:**

```typescript
favorites: defineTable({
  userId: v.id("users"),
  name: v.string(), // User-given name like "Monthly Report"
  query: v.string(), // Original natural language query
  sql: v.string(), // Generated SQL
  tags: v.array(v.string()),
  isPublic: v.boolean(), // Share with team
  createdAt: v.number(),
  useCount: v.number(), // Track usage
}).index("by_user", ["userId"])
  .index("by_public", ["isPublic"]),
```

**Use Case:**

```typescript
// User clicks "Save as Favorite"
await saveFavorite({
  name: 'High Value Loans',
  query: 'Show me loans over $10,000',
  sql: 'SELECT * FROM loan WHERE amount > 10000',
  tags: ['loans', 'high-value'],
  isPublic: false,
})

// Later, load favorites in sidebar
const myFavorites = await getFavorites(currentUser.id)
```

---

### **4. Query History** 📜

**New Feature!**
**Convex Handles:**

- Complete query history
- Success/failure tracking
- Performance metrics

**Schema:**

```typescript
queryHistory: defineTable({
  userId: v.id("users"),
  query: v.string(),
  sql: v.string(),
  tables: v.array(v.string()), // Tables accessed
  success: v.boolean(),
  executionTimeMs: v.optional(v.number()),
  resultCount: v.optional(v.number()),
  error: v.optional(v.string()),
  timestamp: v.number(),
}).index("by_user", ["userId"])
  .index("by_timestamp", ["timestamp"]),
```

**Benefits:**

- View all past queries
- Re-run previous queries
- Analyze most common queries
- Track errors/failures

---

### **5. Audit Logging** 🔒

**Critical for Banking!**
**Convex Handles:**

- Who queried what table
- When and from where
- Success/denied attempts
- Compliance tracking

**Schema:**

```typescript
auditLogs: defineTable({
  userId: v.id("users"),
  userEmail: v.string(),
  action: v.string(), // "query", "login", "export", etc.
  resource: v.string(), // Table name or resource
  sql: v.optional(v.string()),
  success: v.boolean(),
  deniedReason: v.optional(v.string()),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  timestamp: v.number(),
}).index("by_user", ["userId"])
  .index("by_timestamp", ["timestamp"])
  .index("by_resource", ["resource"]),
```

**Compliance Use Case:**

```
Auditor: "Show me all attempts to access the 'client' table last month"

Query: auditLogs.filter(
  log => log.resource === "client" &&
         log.timestamp >= lastMonthStart &&
         log.timestamp <= lastMonthEnd
)
```

---

### **6. User Analytics** 📊

**New Feature!**
**Convex Handles:**

- Track user activity
- Popular queries
- Most queried tables
- Performance metrics

**Schema:**

```typescript
analytics: defineTable({
  userId: v.id("users"),
  metric: v.string(), // "query_count", "table_access", etc.
  value: v.number(),
  metadata: v.optional(v.any()),
  date: v.string(), // "2026-01-09"
}).index("by_user", ["userId"])
  .index("by_date", ["date"]),
```

---

### **7. Team Collaboration** 👥

**New Feature!**
**Convex Handles:**

- Share queries with team
- Collaborative query building
- Team dashboards

**Schema:**

```typescript
teams: defineTable({
  name: v.string(),
  departmentId: v.string(),
  createdAt: v.number(),
}),

teamMembers: defineTable({
  teamId: v.id("teams"),
  userId: v.id("users"),
  role: v.string(), // "admin", "member", "viewer"
}).index("by_team", ["teamId"])
  .index("by_user", ["userId"]),

sharedQueries: defineTable({
  teamId: v.id("teams"),
  createdBy: v.id("users"),
  name: v.string(),
  query: v.string(),
  sql: v.string(),
  description: v.optional(v.string()),
  createdAt: v.number(),
}).index("by_team", ["teamId"]),
```

---

### **8. Notifications** 🔔

**New Feature!**
**Convex Handles:**

- System notifications
- Query completion alerts
- Permission changes
- Team updates

**Schema:**

```typescript
notifications: defineTable({
  userId: v.id("users"),
  type: v.string(), // "query_complete", "permission_granted", etc.
  title: v.string(),
  message: v.string(),
  read: v.boolean(),
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_read", ["read"]),
```

---

## ❌ **What Convex SHOULD NOT Handle** (Financial Data)

### **MySQL Database Stays!**

- ❌ Accounts
- ❌ Transactions
- ❌ Loans
- ❌ Clients
- ❌ Districts
- ❌ Cards

**Why?**

- This is **external, read-only data**
- Not owned by your app
- Hosted elsewhere (relational.fel.cvut.cz)
- Convex is for YOUR application data, not external databases

**Architecture:**

```
User asks query
    ↓
Convex: Save message to chat history
    ↓
Your API: Generate SQL with Gemini
    ↓
Your API: Query MySQL database
    ↓
Convex: Save query result & analytics
    ↓
User sees result (real-time via Convex!)
```

---

## 🏗️ **Complete Convex Schema**

```typescript
// convex/schema.ts
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
  }).index('by_email', ['email']),

  roles: defineTable({
    name: v.string(),
    description: v.string(),
    permissions: v.array(
      v.object({
        resource: v.string(), // table name
        action: v.union(v.literal('allow'), v.literal('deny')),
        conditions: v.optional(v.any()),
      }),
    ),
  }),

  // Chat & Messaging
  conversations: defineTable({
    userId: v.id('users'),
    title: v.string(),
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
    executionTimeMs: v.optional(v.number()),
    error: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index('by_conversation', ['conversationId'])
    .index('by_timestamp', ['timestamp']),

  // Query Management
  favorites: defineTable({
    userId: v.id('users'),
    name: v.string(),
    query: v.string(),
    sql: v.string(),
    tags: v.array(v.string()),
    isPublic: v.boolean(),
    createdAt: v.number(),
    useCount: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_public', ['isPublic']),

  queryHistory: defineTable({
    userId: v.id('users'),
    query: v.string(),
    sql: v.string(),
    tables: v.array(v.string()),
    success: v.boolean(),
    executionTimeMs: v.optional(v.number()),
    resultCount: v.optional(v.number()),
    error: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_timestamp', ['timestamp']),

  // Audit & Compliance
  auditLogs: defineTable({
    userId: v.id('users'),
    userEmail: v.string(),
    action: v.string(),
    resource: v.string(),
    sql: v.optional(v.string()),
    success: v.boolean(),
    deniedReason: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_timestamp', ['timestamp'])
    .index('by_resource', ['resource']),

  // Analytics
  analytics: defineTable({
    userId: v.id('users'),
    metric: v.string(),
    value: v.number(),
    metadata: v.optional(v.any()),
    date: v.string(),
  })
    .index('by_user', ['userId'])
    .index('by_date', ['date']),

  // Team Collaboration
  teams: defineTable({
    name: v.string(),
    departmentId: v.string(),
    createdAt: v.number(),
  }),

  teamMembers: defineTable({
    teamId: v.id('teams'),
    userId: v.id('users'),
    role: v.string(),
  })
    .index('by_team', ['teamId'])
    .index('by_user', ['userId']),

  sharedQueries: defineTable({
    teamId: v.id('teams'),
    createdBy: v.id('users'),
    name: v.string(),
    query: v.string(),
    sql: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_team', ['teamId']),

  // Notifications
  notifications: defineTable({
    userId: v.id('users'),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_read', ['read']),
})
```

---

## 🚀 **Key Convex Functions You'll Need**

### **1. Chat Functions**

```typescript
// convex/chat.ts
export const sendMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    content: v.string(),
    type: v.union(v.literal('user'), v.literal('assistant')),
    sql: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Save message to Convex
    await ctx.db.insert('messages', {
      ...args,
      timestamp: Date.now(),
    })
  },
})

export const getConversationMessages = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId),
      )
      .collect()
  },
})
```

### **2. Favorites Functions**

```typescript
// convex/favorites.ts
export const saveFavorite = mutation({
  args: {
    name: v.string(),
    query: v.string(),
    sql: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    return await ctx.db.insert('favorites', {
      userId: identity.subject,
      ...args,
      isPublic: false,
      createdAt: Date.now(),
      useCount: 0,
    })
  },
})

export const getFavorites = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    return await ctx.db
      .query('favorites')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect()
  },
})
```

### **3. Audit Logging**

```typescript
// convex/audit.ts
export const logQuery = mutation({
  args: {
    query: v.string(),
    sql: v.string(),
    tables: v.array(v.string()),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    await ctx.db.insert('auditLogs', {
      userId: identity.subject,
      userEmail: identity.email,
      action: 'query',
      resource: args.tables.join(', '),
      ...args,
      timestamp: Date.now(),
    })
  },
})
```

---

## 📦 **Installation Steps**

### **1. Install Convex**

```bash
npm install convex
npx convex dev
```

### **2. Setup Convex Config**

```javascript
// convex.json
{
  "functions": "convex/",
  "generateCommonJSApi": false
}
```

### **3. Create Schema**

Create `convex/schema.ts` with the schema above

### **4. Initialize Functions**

Create `convex/chat.ts`, `convex/favorites.ts`, etc.

### **5. Setup Convex Provider**

```typescript
// src/routes/__root.tsx
import { ConvexProvider, ConvexReactClient } from "convex/react"

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

<ConvexProvider client={convex}>
  <AuthProvider>
    {children}
  </AuthProvider>
</ConvexProvider>
```

---

## ✨ **Real-Time Features You Get For Free**

### **1. Live Chat Updates**

```typescript
// Any user change instantly updates all clients!
const messages = useQuery(api.chat.getConversationMessages, {
  conversationId: currentConversation,
})
// ↑ Auto-updates in real-time!
```

### **2. Collaborative Queries**

- Team member creates favorite → You see it instantly
- Someone shares query → Appears in your sidebar immediately

### **3. Live Notifications**

```typescript
const notifications = useQuery(api.notifications.getUnread)
// ↑ Updates live as new notifications arrive
```

---

## 🎯 **Benefits Summary**

| Feature           | Without Convex     | With Convex                |
| ----------------- | ------------------ | -------------------------- |
| Chat History      | ❌ Lost on refresh | ✅ Persists forever        |
| Query Favorites   | ❌ None            | ✅ Save & organize         |
| Team Sharing      | ❌ None            | ✅ Real-time collaboration |
| Audit Logs        | ❌ Console only    | ✅ Database + compliance   |
| Analytics         | ❌ None            | ✅ Full tracking           |
| Real-time Updates | ❌ Manual refresh  | ✅ Automatic sync          |
| Multi-device      | ❌ None            | ✅ Same state everywhere   |
| Offline Support   | ❌ None            | ✅ Built-in                |

---

## 🚦 **Implementation Timeline**

### **Phase 1: Core Setup** (Day 1-2)

- Install Convex
- Create schema
- Migrate users from mock store
- Setup authentication

### **Phase 2: Chat Integration** (Day 3-4)

- Replace chat-store with Convex
- Add conversation management
- Persist messages

### **Phase 3: Features** (Week 2)

- Add favorites
- Add query history
- Add audit logging

### **Phase 4: Collaboration** (Week 3)

- Team features
- Shared queries
- Real-time notifications

---

## 💰 **Cost Estimate**

Convex Free Tier:

- ✅ 1GB database
- ✅ 1M function calls/month
- ✅ Unlimited real-time connections
- ✅ All features included

**For your app:** FREE tier is plenty! (Unless you have 1000+ users)

---

## 🎯 **Recommendation**

**YES, integrate Convex!** Here's why:

1. ✅ **Perfect Fit** - Handles all app data, not financial data
2. ✅ **Real-Time** - Chat updates, notifications, collaboration
3. ✅ **Persistence** - No more lost messages
4. ✅ **Scalable** - Handles growth automatically
5. ✅ **Free Tier** - Costs $0 to start
6. ✅ **Better Auth** - Replace JWT with Convex Auth
7. ✅ **Type-Safe** - Full TypeScript support
8. ✅ **Simple** - Easier than building your own backend

**Keep MySQL for:** Financial data queries (accounts, transactions, etc.)
**Use Convex for:** Everything else (users, chats, favorites, analytics)

---

## 🚀 **Next Steps**

Want me to:

1. **Implement Convex integration** - I'll set it up for you
2. **Create migration guide** - Step-by-step instructions
3. **Just give documentation** - You implement it yourself

Let me know! 🎉
