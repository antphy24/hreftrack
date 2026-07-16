export function downloadCSV(data: any[], filename: string) {
  if (!data || !data.length) {
    return
  }

  const separator = ','
  const keys = Object.keys(data[0])
  const csvContent =
    keys.join(separator) +
    '\n' +
    data.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k]
        cell = cell instanceof Date
          ? cell.toLocaleString()
          : cell.toString().replace(/"/g, '""')
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`
        }
        return cell
      }).join(separator)
    }).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) { // feature detection
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export function parseCSV(text: string): string[][] {
  const result: string[][] = []
  let currentLine: string[] = []
  let currentCell = ''
  let inQuotes = false

  // Handle BOM
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1)
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"'
        i++ // skip next quote
      } else if (char === '"') {
        inQuotes = false
      } else {
        currentCell += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        currentLine.push(currentCell.trim())
        currentCell = ''
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        if (char === '\r') i++ // skip \n
        currentLine.push(currentCell.trim())
        if (currentLine.some(c => c !== '')) {
          result.push(currentLine)
        }
        currentLine = []
        currentCell = ''
      } else {
        currentCell += char
      }
    }
  }

  if (currentCell !== '' || currentLine.length > 0) {
    currentLine.push(currentCell.trim())
    if (currentLine.some(c => c !== '')) {
      result.push(currentLine)
    }
  }

  return result
}
