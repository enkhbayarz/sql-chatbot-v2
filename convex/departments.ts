import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

/**
 * Get department by ID
 */
export const getDepartmentById = query({
  args: { departmentId: v.string() },
  handler: async (ctx, args) => {
    const departments = await ctx.db.query('departments').collect()
    return departments.find((d) => d._id === args.departmentId)
  },
})

/**
 * Get all departments
 */
export const getAllDepartments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('departments').collect()
  },
})

/**
 * Create a department
 */
export const createDepartment = mutation({
  args: {
    name: v.string(),
    allowedTables: v.array(v.string()),
    deniedTables: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('departments', args)
  },
})
