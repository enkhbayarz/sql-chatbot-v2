import { mutation } from './_generated/server'

/**
 * Seed initial data (users, roles, departments)
 * Run this once after setting up Convex
 */
export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingUsers = await ctx.db.query('users').first()
    if (existingUsers) {
      console.log('Data already seeded, skipping...')
      return { message: 'Data already exists' }
    }

    // Create Roles
    const adminRoleId = await ctx.db.insert('roles', {
      name: 'Admin',
      description: 'Full access to all tables',
      priority: 100,
      permissions: [{ type: 'table', resource: '*', action: 'allow' }],
    })

    const hrSeniorRoleId = await ctx.db.insert('roles', {
      name: 'HR Senior',
      description: 'Access to HR-related tables, can view transactions',
      priority: 50,
      permissions: [
        { type: 'table', resource: 'client', action: 'allow' },
        { type: 'table', resource: 'account', action: 'allow' },
        { type: 'table', resource: 'disp', action: 'allow' },
        { type: 'table', resource: 'district', action: 'allow' },
        {
          type: 'table',
          resource: 'trans',
          action: 'allow',
          conditions: { rowLimit: 1000 },
        },
      ],
    })

    const hrJuniorRoleId = await ctx.db.insert('roles', {
      name: 'HR Junior',
      description: 'Limited HR access, cannot view transactions or loans',
      priority: 30,
      permissions: [
        { type: 'table', resource: 'client', action: 'allow' },
        { type: 'table', resource: 'account', action: 'allow' },
        { type: 'table', resource: 'disp', action: 'allow' },
        { type: 'table', resource: 'district', action: 'allow' },
        { type: 'table', resource: 'trans', action: 'deny' },
        { type: 'table', resource: 'loan', action: 'deny' },
      ],
    })

    const financeRoleId = await ctx.db.insert('roles', {
      name: 'Finance Analyst',
      description:
        'Access to financial tables, cannot see personal client info',
      priority: 50,
      permissions: [
        { type: 'table', resource: 'account', action: 'allow' },
        { type: 'table', resource: 'trans', action: 'allow' },
        { type: 'table', resource: 'loan', action: 'allow' },
        { type: 'table', resource: 'order', action: 'allow' },
        { type: 'table', resource: 'card', action: 'allow' },
        { type: 'table', resource: 'district', action: 'allow' },
        { type: 'table', resource: 'client', action: 'deny' },
      ],
    })

    // Create Departments
    const hrDeptId = await ctx.db.insert('departments', {
      name: 'Human Resources',
      allowedTables: ['client', 'account', 'disp', 'district'],
      deniedTables: [],
    })

    const financeDeptId = await ctx.db.insert('departments', {
      name: 'Finance',
      allowedTables: ['account', 'trans', 'loan', 'order', 'card', 'district'],
      deniedTables: ['client'],
    })

    const operationsDeptId = await ctx.db.insert('departments', {
      name: 'Operations',
      allowedTables: ['*'],
      deniedTables: [],
    })

    // Create Users (with plaintext password hashes for now)
    // In production, use proper password hashing (bcrypt, etc.)
    await ctx.db.insert('users', {
      email: 'admin@bank.com',
      name: 'Alice Admin',
      roleIds: [adminRoleId],
      departmentId: operationsDeptId,
      isActive: true,
      preferences: {
        theme: 'dark',
        notificationsEnabled: true,
      },
      createdAt: Date.now(),
      passwordHash: 'admin123', // Temporary - replace with proper hash
    })

    await ctx.db.insert('users', {
      email: 'hr.senior@bank.com',
      name: 'Bob HR Senior',
      roleIds: [hrSeniorRoleId],
      departmentId: hrDeptId,
      isActive: true,
      preferences: {
        theme: 'dark',
        notificationsEnabled: true,
      },
      createdAt: Date.now(),
      passwordHash: 'hr123', // Temporary
    })

    await ctx.db.insert('users', {
      email: 'hr.junior@bank.com',
      name: 'Carol HR Junior',
      roleIds: [hrJuniorRoleId],
      departmentId: hrDeptId,
      isActive: true,
      preferences: {
        theme: 'dark',
        notificationsEnabled: true,
      },
      createdAt: Date.now(),
      passwordHash: 'hr123', // Temporary
    })

    await ctx.db.insert('users', {
      email: 'finance@bank.com',
      name: 'David Finance',
      roleIds: [financeRoleId],
      departmentId: financeDeptId,
      isActive: true,
      preferences: {
        theme: 'dark',
        notificationsEnabled: true,
      },
      createdAt: Date.now(),
      passwordHash: 'finance123', // Temporary
    })

    return { message: 'Initial data seeded successfully' }
  },
})
