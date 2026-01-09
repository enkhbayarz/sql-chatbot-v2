import type { Department, Role, User } from './types'

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

// Mock users with plaintext passwords (for testing only)
export const MOCK_USERS: Map<string, User> = new Map([
  [
    'user-1',
    {
      id: 'user-1',
      email: 'admin@bank.com',
      name: 'Alice Admin',
      roleIds: ['role-admin'],
      departmentId: 'dept-operations',
      createdAt: new Date('2024-01-01'),
      isActive: true,
    },
  ],
  [
    'user-2',
    {
      id: 'user-2',
      email: 'hr.senior@bank.com',
      name: 'Bob HR Senior',
      roleIds: ['role-hr-senior'],
      departmentId: 'dept-hr',
      createdAt: new Date('2024-01-01'),
      isActive: true,
    },
  ],
  [
    'user-3',
    {
      id: 'user-3',
      email: 'hr.junior@bank.com',
      name: 'Carol HR Junior',
      roleIds: ['role-hr-junior'],
      departmentId: 'dept-hr',
      createdAt: new Date('2024-01-01'),
      isActive: true,
    },
  ],
  [
    'user-4',
    {
      id: 'user-4',
      email: 'finance@bank.com',
      name: 'David Finance',
      roleIds: ['role-finance-analyst'],
      departmentId: 'dept-finance',
      createdAt: new Date('2024-01-01'),
      isActive: true,
    },
  ],
])

// Mock credentials (plaintext for testing - will be replaced with external auth)
export const MOCK_CREDENTIALS: Map<string, string> = new Map([
  ['admin@bank.com', 'admin123'],
  ['hr.senior@bank.com', 'hr123'],
  ['hr.junior@bank.com', 'hr123'],
  ['finance@bank.com', 'finance123'],
])

// Mock roles with permissions
export const MOCK_ROLES: Map<string, Role> = new Map([
  [
    'role-admin',
    {
      id: 'role-admin',
      name: 'Admin',
      description: 'Full access to all tables',
      priority: 100,
      permissions: [{ type: 'table', resource: '*', action: 'allow' }],
    },
  ],
  [
    'role-hr-senior',
    {
      id: 'role-hr-senior',
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
    },
  ],
  [
    'role-hr-junior',
    {
      id: 'role-hr-junior',
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
    },
  ],
  [
    'role-finance-analyst',
    {
      id: 'role-finance-analyst',
      name: 'Finance Analyst',
      description: 'Access to financial tables, cannot see personal client info',
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
    },
  ],
])

// Mock departments with default table access
export const MOCK_DEPARTMENTS: Map<string, Department> = new Map([
  [
    'dept-hr',
    {
      id: 'dept-hr',
      name: 'Human Resources',
      allowedTables: ['client', 'account', 'disp', 'district'],
      deniedTables: [],
    },
  ],
  [
    'dept-finance',
    {
      id: 'dept-finance',
      name: 'Finance',
      allowedTables: ['account', 'trans', 'loan', 'order', 'card', 'district'],
      deniedTables: ['client'],
    },
  ],
  [
    'dept-operations',
    {
      id: 'dept-operations',
      name: 'Operations',
      allowedTables: ['*'],
      deniedTables: [],
    },
  ],
])

// Helper function to find user by email
export function findUserByEmail(email: string): User | undefined {
  for (const user of MOCK_USERS.values()) {
    if (user.email === email) {
      return user
    }
  }
  return undefined
}

// Helper function to validate credentials
export function validateCredentials(
  email: string,
  password: string,
): User | null {
  const storedPassword = MOCK_CREDENTIALS.get(email)
  if (!storedPassword || storedPassword !== password) {
    return null
  }

  return findUserByEmail(email) || null
}
