#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import * as cheerio from 'cheerio'

function to24(timeStr) {
  if (!timeStr) return ''
  const m = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!m) return timeStr.trim()
  let hh = parseInt(m[1], 10)
  const mm = m[2]
  const ampm = m[3].toUpperCase()
  if (ampm === 'AM' && hh === 12) hh = 0
  if (ampm === 'PM' && hh !== 12) hh = hh + 12
  return (hh < 10 ? '0' + hh : '' + hh) + ':' + mm
}

async function parseFile(filePath) {
  const html = await fs.readFile(filePath, 'utf8')
  const $ = cheerio.load(html)

  // Find the table which has the header 'Date & Time' / 'Program Details'
  const table = $('table').filter((i, el) => {
    return $(el).find('th').first().text().includes('Date') && $(el).find('th').eq(1).text().includes('Program')
  }).first()

  if (!table || !table.length) {
    console.warn(`No matching table found in ${filePath}`)
    return []
  }

  const rows = []
  const trs = table.find('tr').slice(1) // skip header
  trs.each((i, tr) => {
    const tds = $(tr).find('td')
    if (tds.length < 2) return

    // First column: date and time separated by <br>
    const col1Html = $(tds[0]).html() || ''
    const col1Text = col1Html.replace(/<br\s*\/?\s*>/gi, '\n')
    const col1Lines = col1Text.split('\n').map(s => s.trim()).filter(Boolean)
    const dateRaw = col1Lines[0] || ''
    const timeRaw = (col1Lines[1] || '')
    const time24 = to24(timeRaw)

    // Second column: artists lines, then an empty break, then <b>Venue</b> then address
    const col2 = $(tds[1])
    const venue = col2.find('b').first().text().trim()

    // Full text of 2nd column; split on venue to isolate artists block
    const col2Text = col2.text()
    let artistsBlock = col2Text
    if (venue) {
      const parts = col2Text.split(venue)
      artistsBlock = parts[0]
    }

    // Normalize breaks and extract non-empty lines
    const artistLines = artistsBlock.split('\n').map(s => s.trim()).filter(Boolean)

    // Clean artist names: remove parenthesis parts and split on commas
    const artistNames = []
    for (const line of artistLines) {
      // Skip lines that are obviously not artist (e.g., empty or disclaimers)
      if (!line) continue
      // Remove parenthesis contents
      let cleaned = line.replace(/\s*\([^)]*\)/g, '').trim()
      if (!cleaned) continue
      // Split by comma to handle multiple names on one line
      const parts = cleaned.split(',').map(p => p.trim()).filter(Boolean)
      for (const p of parts) {
        // Avoid accidentally capturing the venue name or repeated fragments
        if (venue && p.includes(venue)) continue
        artistNames.push(p)
      }
    }

    rows.push({
      date: dateRaw,
      time: time24,
      venue_name: venue,
      artist_names: artistNames
    })
  })

  return rows
}

async function main() {
  const pagesDir = path.join(process.cwd(), 'pages')
  const files = await fs.readdir(pagesDir)
  const htmlFiles = files.filter(f => f.endsWith('.html')).sort()

  const all = []
  for (const f of htmlFiles) {
    const full = path.join(pagesDir, f)
    try {
      const parsed = await parseFile(full)
      all.push(...parsed)
    } catch (err) {
      console.error(`Error parsing ${f}:`, err.message)
    }
  }

  const outPath = path.join(process.cwd(), 'parsed_schedule.json')
  await fs.writeFile(outPath, JSON.stringify(all, null, 2), 'utf8')
  console.log(`Parsed ${all.length} entries. Output written to ${outPath}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})