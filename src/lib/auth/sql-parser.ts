/**
 * SQL Parser Utility
 * Extracts table names from SQL queries
 * Handles: FROM, JOIN, INTO, UPDATE statements
 */

const SQL_KEYWORDS = new Set([
  'SELECT',
  'WHERE',
  'GROUP',
  'ORDER',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'AS',
  'ON',
  'AND',
  'OR',
  'BY',
  'ASC',
  'DESC',
  'DISTINCT',
  'ALL',
  'ANY',
  'SOME',
  'EXISTS',
  'IN',
  'NOT',
  'NULL',
  'IS',
  'LIKE',
  'BETWEEN',
  'INNER',
  'LEFT',
  'RIGHT',
  'OUTER',
  'FULL',
  'CROSS',
  'NATURAL',
])

/**
 * Extract table names from SQL query
 * @param sql - SQL query string
 * @returns Array of table names found in the query
 */
export function extractTablesFromSQL(sql: string): Array<string> {
  const tables = new Set<string>()
  const normalized = sql.toLowerCase()

  // Pattern: FROM table_name or JOIN table_name or UPDATE table_name or INTO table_name
  // Handles optional backticks/quotes around table names
  const patterns = [
    /from\s+[`"]?(\w+)[`"]?/gi,
    /join\s+[`"]?(\w+)[`"]?/gi,
    /into\s+[`"]?(\w+)[`"]?/gi,
    /update\s+[`"]?(\w+)[`"]?/gi,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(normalized)) !== null) {
      const tableName = match[1]
      if (tableName && !SQL_KEYWORDS.has(tableName.toUpperCase())) {
        tables.add(tableName)
      }
    }
  }

  return Array.from(tables)
}

/**
 * Check if SQL query contains any table references
 */
export function hasTables(sql: string): boolean {
  return extractTablesFromSQL(sql).length > 0
}
