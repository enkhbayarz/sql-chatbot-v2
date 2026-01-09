export interface User {
  id: string
  email: string
  name: string
  roleIds: Array<string>
  departmentId: string
  createdAt: Date
  isActive: boolean
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Array<Permission>
  priority: number
}

export interface Department {
  id: string
  name: string
  allowedTables: Array<string>
  deniedTables: Array<string>
}

export interface Permission {
  type: 'table'
  resource: string // table name or '*' for all
  action: 'allow' | 'deny'
  conditions?: {
    rowLimit?: number
    timeRestriction?: string
  }
}

export interface UserPermissions {
  userId: string
  allowedTables: Set<string>
  deniedTables: Set<string>
  maxRowLimit: number
  isAdmin: boolean
}

export interface JWTPayload {
  userId: string
  email: string
  roleIds: Array<string>
  departmentId: string
  iat: number
  exp: number
}

export interface AuditLog {
  id: string
  userId: string
  action: 'query' | 'login' | 'logout' | 'denied'
  query?: string
  tables?: Array<string>
  timestamp: Date
  success: boolean
  errorMessage?: string
}
