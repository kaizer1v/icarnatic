import puppeteer from "puppeteer";
import fs from "fs"

async function scrapePages(startPage = 1, endPage = 3) {
  const baseURL = "https://icarnatic.org/Season2025.aspx?page="
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  const results = []

  for(let p = startPage; p <= endPage; p++) {
    console.log(`➡️ Scraping page ${p}...`)
    await page.goto(`${baseURL}${p}`, { waitUntil: "networkidle2" })

    // Wait for the table container
    await page.waitForSelector("body")

    // Extract rows
    const data = await page.evaluate(() => {
      // All lines of the table are directly inside the BODY in text blocks
      // We match the pattern: DATE & TIME then program details then venue
      const rows = []
      const nodes = Array.from(document.querySelectorAll("body > *"))

      let i = 0
      while (i < nodes.length) {
        const text = nodes[i].innerText?.trim()
        if (!text) { i++; continue; }

        // YYYY-Mon-DD and Time pattern
        let match = text.match(/^(\d{2}-[A-Za-z]{3}-\d{4})\s+(\d{1,2}:\d{2}\s+(AM|PM))/)
        if (match) {
          const date = match[1]
          const time = match[2]
          const row = { date, time, programLines: [] }

          // The next lines all belong to this concert entry
          i++;
          while (i < nodes.length && !nodes[i].innerText.match(/^\d{2}-[A-Za-z]{3}-\d{4}/)) {
            const t = nodes[i].innerText.trim()
            if (t) row.programLines.push(t)
            i++
          }
          rows.push(row)
        } else {
          i++
        }
      }
      return rows
    });

    for (const item of data) {
      // Convert to 24-hour
      const [timeStr] = item.time.split(" ")
      const iso = new Date(`${item.date} ${item.time}`)
      const h24 = iso.toLocaleTimeString("en-GB", { hour12: false, hour:"2-digit", minute:"2-digit" })

      // Extract artist name (first line of program details)
      const artistLine = item.programLines[0] || ""
      const artistName = artistLine.replace(/\s*\(.*?\)/g, "").trim()

      // The **venue** is typically the *last line* of program lines
      const venue = item.programLines[item.programLines.length - 1] || ""

      results.push({
        date: item.date,
        start_time: h24,
        artist_name: artistName,
        venue_name: venue
      })
    }
  }

  await browser.close()
  return results
}

(async () => {
  const data = await scrapePages(1, 57)
  fs.writeFileSync("season2025.json", JSON.stringify(data, null, 2))
  console.log(JSON.stringify(data, null, 2))
  console.log("✅ Data saved to season2025.json")
})()
