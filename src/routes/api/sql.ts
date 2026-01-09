import { createFileRoute } from '@tanstack/react-router'
import { GoogleGenerativeAI } from '@google/generative-ai'
import mysql, { Connection, RowDataPacket } from 'mysql2/promise'

// Configure Gemini
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// MySQL Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'relational.fel.cvut.cz',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'guest',
  password: process.env.DB_PASSWORD || 'ctu-relational',
  database: process.env.DB_NAME || 'financial',
}

let connection: Connection | null = null

// Initialize MySQL connection
async function connectToDatabase(): Promise<Connection> {
  try {
    connection = await mysql.createConnection(dbConfig)
    console.log('✅ Successfully connected to MySQL database')
    return connection
  } catch (error: any) {
    console.error('❌ Error connecting to database:', error.message)
    throw error
  }
}

// Close database connection
async function closeConnection(): Promise<void> {
  if (connection) {
    await connection.end()
    connection = null
    console.log('👋 Database connection closed.')
  }
}

const SYSTEM_PROMPT = `You are a SQL assistant for a banking database. Generate ONLY executable PostgreSQL SELECT queries.

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
        const { prompt } = await request.json()

        if (!prompt) {
          return Response.json({ error: 'Missing prompt' }, { status: 400 })
        }

        try {
          const result = await processQuery(prompt)
          return Response.json(result)
        } catch (error: any) {
          return Response.json(
            { error: error.message || 'An error occurred' },
            { status: 500 },
          )
        } finally {
          await closeConnection()
        }
      },
    },
  },
})

async function processQuery(userQuery: string) {
  console.log(`\n🤖 Generating SQL for: ${userQuery}\n`)

  // Step 1: Generate SQL using Gemini
  const sql = await generateSQL(userQuery)

  console.log('📝 Generated SQL:')
  console.log('-'.repeat(60))
  console.log(sql)
  console.log('-'.repeat(60))

  // Step 2: Execute the query
  try {
    const results = await executeQueryAndReturn(sql)
    return {
      sql,
      results,
      error: null,
    }
  } catch (error: any) {
    console.error(`❌ Query execution error: ${error.message}`)
    return {
      sql,
      results: null,
      error: error.message,
    }
  }
}

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
            text: "I understand. I'll generate PostgreSQL SELECT queries for your banking database.",
          },
        ],
      },
    ],
  })

  const result = await chat.sendMessage(userQuery)
  const response = await result.response
  const rawSQL = response.text().trim()

  // Clean the SQL to remove markdown formatting
  return cleanSQL(rawSQL)
}

async function executeQueryAndReturn(sqlQuery: string): Promise<any[]> {
  const conn = await connectToDatabase()

  const [rows] = await conn.execute<RowDataPacket[]>(sqlQuery)

  if (rows.length === 0) {
    console.log('\n📊 No results found.')
    return []
  }

  console.log(`\n📈 Total rows: ${rows.length}`)
  return rows
}
