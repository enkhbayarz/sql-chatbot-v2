import { createFileRoute } from '@tanstack/react-router'
import { GoogleGenerativeAI } from '@google/generative-ai'
import mysql, { Connection, RowDataPacket } from 'mysql2/promise'

import { env } from '@/lib/env'
import { withAuth } from '@/lib/auth/middleware'
import { PermissionResolver } from '@/lib/auth/permission-resolver'
import { extractTablesFromSQL } from '@/lib/auth/sql-parser'

// Configure Gemini
const genai = new GoogleGenerativeAI(env.GEMINI_API_KEY)

// MySQL Database Configuration
const dbConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
}

let connection: Connection | null = null

// Initialize MySQL connection
async function connectToDatabase(): Promise<Connection> {
  try {
    connection = await mysql.createConnection(dbConfig)
    return connection
  } catch (error: any) {
    console.error('[DB Error] Failed to connect:', error.message)
    throw new Error('Database connection failed')
  }
}

// Close database connection
async function closeConnection(): Promise<void> {
  if (connection) {
    await connection.end()
    connection = null
  }
}

const SYSTEM_PROMPT = `You are a SQL assistant for a banking database. Generate ONLY executable MariaDB/MySQL SELECT queries.

## Database Schema:

**district** (district_id, A2, A3, A4, A11, A15, A16)
- Demographic data: name, region, inhabitants, avg salary, crimes

**account** (account_id, district_id, frequency, date)
- Bank accounts

**client** (client_id, birth_number, district_id)
- Bank clients

**disp** (disp_id, client_id, account_id, type)
- Account-client relationships (type: OWNER/USER)

**trans** (trans_id, account_id, date, type, operation, amount, balance, k_symbol, bank, account_to)
- Transactions (type: PRIJEM=Credit, VYDAJ=Debit)

**loan** (loan_id, account_id, date, amount, duration, payments, status)
- Loans (status: A/B/C/D)

**card** (card_id, disp_id, type, issued)
- Cards (type: classic/junior/gold)

**order** (order_id, account_id, bank_to, account_to, amount, k_symbol)
- Permanent payment orders

## Rules:
- Generate ONLY SELECT queries
- Use table aliases (e.g., \`SELECT a.* FROM account a\`)
- Limit to 100 rows unless specified
- Use proper JOINs for related tables
- Return ONLY the SQL query, no explanations

## Example:
User: "Show me all accounts"
Response: SELECT * FROM account LIMIT 100;
`

export const Route = createFileRoute('/api/sql')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return withAuth(request, async (req, user, permissions) => {
          const { prompt } = await req.json()

          if (!prompt) {
            return Response.json({ error: 'Missing prompt' }, { status: 400 })
          }

          try {
            // Get allowed tables for this user
            const allowedTables = Array.from(permissions.allowedTables)

            // Inject allowed tables into Gemini prompt
            const enhancedPrompt = `
IMPORTANT SECURITY CONSTRAINT:
You can ONLY query these tables: ${allowedTables.join(', ')}
Do NOT reference any other tables. If the user asks for data from unauthorized tables, politely explain you cannot access those tables.

User Query: ${prompt}
            `.trim()

            // Generate SQL with permissions injected
            const sql = await generateSQL(enhancedPrompt)

            // Extract tables from generated SQL
            const usedTables = extractTablesFromSQL(sql)

            // Validate table permissions
            const validation = PermissionResolver.canAccessTables(
              permissions,
              usedTables,
            )

            if (!validation.allowed) {
              // Log security violation
              console.error(
                `[Auth] Access denied: ${user.email} tried to access: ${validation.deniedTables.join(', ')}`,
              )

              return Response.json(
                {
                  sql,
                  results: null,
                  error: `Access denied to tables: ${validation.deniedTables.join(', ')}. You can only access: ${allowedTables.join(', ')}`,
                },
                { status: 403 },
              )
            }

            // Execute the query
            const results = await executeQueryAndReturn(sql)

            return Response.json({
              sql,
              results,
              error: null,
            })
          } catch (error: any) {
            console.error('[API Error]:', error.message)
            return Response.json(
              {
                sql: null,
                results: null,
                error: error.message || 'An error occurred',
              },
              { status: 500 },
            )
          } finally {
            await closeConnection()
          }
        })
      },
    },
  },
})


function cleanSQL(sqlString: string): string {
  // Remove markdown code block syntax
  let cleaned = sqlString.trim()

  // Remove ```sql or ``` at the start
  cleaned = cleaned.replace(/^```(?:sql)?\s*/i, '')

  // Remove ``` at the end
  cleaned = cleaned.replace(/\s*```\s*$/i, '')

  return cleaned.trim()
}

async function generateSQL(userQuery: string): Promise<string> {
  const model = genai.getGenerativeModel({ model: 'gemini-3-flash-preview' })

  const chat = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: 'model',
        parts: [
          {
            text: "I understand. I'll generate MariaDB/MySQL SELECT queries for your banking database.",
          },
        ],
      },
    ],
  })

  const result = await chat.sendMessage(userQuery)
  const response = result.response
  const rawSQL = response.text().trim()

  // Clean the SQL to remove markdown formatting
  return cleanSQL(rawSQL)
}

async function executeQueryAndReturn(sqlQuery: string): Promise<any[]> {
  const conn = await connectToDatabase()
  const [rows] = await conn.execute<RowDataPacket[]>(sqlQuery)
  return rows
}
