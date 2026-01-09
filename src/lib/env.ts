/**
 * Environment variable validation utility
 * Validates required environment variables at startup
 */

interface EnvConfig {
  GEMINI_API_KEY: string
  DB_HOST: string
  DB_PORT: number
  DB_USER: string
  DB_PASSWORD: string
  DB_NAME: string
  JWT_SECRET: string
  CONVEX_URL?: string // Optional for now, will be required later
}

function validateEnv(): EnvConfig {
  const errors: string[] = []

  // Required environment variables
  const requiredVars = [
    'GEMINI_API_KEY',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
  ] as const

  // Check for missing variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  }

  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long')
  }

  // Validate DB_PORT is a number
  const dbPort = parseInt(process.env.DB_PORT || '3306')
  if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
    errors.push('DB_PORT must be a valid port number (1-65535)')
  }

  if (errors.length > 0) {
    console.error('Environment validation failed:')
    errors.forEach((error) => console.error(`  - ${error}`))
    throw new Error(
      'Environment validation failed. Please check your .env file.',
    )
  }

  return {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: dbPort,
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_NAME: process.env.DB_NAME!,
    JWT_SECRET: process.env.JWT_SECRET!,
    CONVEX_URL: process.env.CONVEX_URL,
  }
}

// Validate and export config
export const env = validateEnv()
