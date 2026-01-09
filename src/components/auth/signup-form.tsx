import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api } from 'convex/_generated/api'

interface Role {
  _id: string
  name: string
  description: string
}

interface Department {
  _id: string
  name: string
}

export function SignupForm() {
  const { signup, isLoading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [roleId, setRoleId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const navigate = useNavigate()

  // Use Convex useQuery hooks to fetch roles and departments
  const rolesData = useQuery(api.roles.getAllRoles, {})
  const departmentsData = useQuery(api.departments.getAllDepartments, {})

  const roles = rolesData || []
  const departments = departmentsData || []

  const loadingOptions =
    rolesData === undefined || departmentsData === undefined

  // Set default values when data loads
  useEffect(() => {
    if (roles && roles.length > 0 && !roleId) {
      setRoleId(roles[0]._id)
    }
  }, [roles, roleId])

  useEffect(() => {
    if (departments && departments.length > 0 && !departmentId) {
      setDepartmentId(departments[0]._id)
    }
  }, [departments, departmentId])

  // Debug logging
  useEffect(() => {
    if (rolesData !== undefined) {
      console.log('Roles loaded:', rolesData)
    }
    if (departmentsData !== undefined) {
      console.log('Departments loaded:', departmentsData)
    }
  }, [rolesData, departmentsData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roleId || !departmentId) {
      return
    }

    try {
      await signup(email, password, name, [roleId], departmentId)
      navigate({ to: '/' })
    } catch (err) {
      // Error is handled by auth context
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Sign up to access the SQL chatbot</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading || loadingOptions}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@bank.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || loadingOptions}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading || loadingOptions}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              required
              disabled={isLoading || loadingOptions}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingOptions ? (
                <option value="">Loading roles...</option>
              ) : roles.length === 0 ? (
                <option value="">
                  No roles available. Please seed data first.
                </option>
              ) : (
                roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name} - {role.description}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <select
              id="department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
              disabled={isLoading || loadingOptions}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingOptions ? (
                <option value="">Loading departments...</option>
              ) : departments.length === 0 ? (
                <option value="">
                  No departments available. Please seed data first.
                </option>
              ) : (
                departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loadingOptions &&
            roles.length === 0 &&
            departments.length === 0 && (
              <Alert>
                <AlertDescription>
                  <strong>No data available.</strong> Please seed the Convex
                  database first by running the seed function in the Convex
                  dashboard or via the API.
                </AlertDescription>
              </Alert>
            )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || loadingOptions || !roleId || !departmentId}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
