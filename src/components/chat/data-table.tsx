import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface DataTableProps {
  data: Array<Record<string, any>>
}

function convertToCSV(data: Array<Record<string, any>>): string {
  if (!data || data.length === 0) return ''

  const columns = Object.keys(data[0])

  // Create CSV header
  const header = columns.map((col) => `"${col}"`).join(',')

  // Create CSV rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const value = row[col]
        if (value === null || value === undefined) return '""'

        // Escape quotes and wrap in quotes
        const stringValue = String(value).replace(/"/g, '""')
        return `"${stringValue}"`
      })
      .join(',')
  })

  return [header, ...rows].join('\n')
}

function downloadCSV(data: Array<Record<string, any>>) {
  const csv = convertToCSV(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `query-results-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function DataTable({ data }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        No results found
      </div>
    )
  }

  const columns = Object.keys(data[0])

  return (
    <div className="w-full overflow-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-3 text-left font-semibold text-foreground"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              {columns.map((column) => (
                <td key={column} className="px-4 py-3 text-foreground">
                  {row[column] === null || row[column] === undefined
                    ? '—'
                    : String(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <span>
          Showing {data.length} {data.length === 1 ? 'row' : 'rows'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadCSV(data)}
          className="gap-2 h-7"
        >
          <Download className="h-3 w-3" />
          Download CSV
        </Button>
      </div>
    </div>
  )
}
