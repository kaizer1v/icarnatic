# iCarnatic Chennai Music Season 2025 - Project Specification

## Project Overview
A Node.js-based application to scrape, parse, and serve Chennai Music Season 2025 concert schedule data through both a REST API and a web front-end.

---

## Architecture

### Technology Stack
- **Backend API**: Express.js (Node.js)
- **Frontend**: Node.js + Vite or Next.js (server-side rendering + SPA)
- **Data Processing**: Cheerio (HTML parsing), Puppeteer (web scraping)
- **Data Storage**: JSON files (parsed_schedule.json, season2025.json)
- **Runtime**: Node.js 23+

---

## Core Modules

### 1. Data Collection & Parsing
**Files**: `scraper.js`, `parse_local.js`

#### `scraper.js` - Web Scraper
- **Purpose**: Fetch live concert pages from icarnatic.org
- **Input**: Base URL + page range
- **Output**: `season2025.json`
- **Process**:
  - Uses Puppeteer to load pages with JavaScript rendering
  - Waits for network idle
  - Extracts concert entries from DOM

#### `parse_local.js` - Local HTML Parser
- **Purpose**: Parse pre-downloaded HTML files into structured JSON
- **Input**: HTML files in `pages/` directory
- **Output**: `parsed_schedule.json`
- **Extracts**:
  - `date`: DD-MMM-YYYY format (e.g., "31-Dec-2025")
  - `time`: 24-hour format (e.g., "10:00")
  - `venue_name`: Concert venue name
  - `artist_names`: Array of performing artists

---

### 2. Backend API
**Framework**: Express.js

#### Endpoints

##### `GET /api/concerts`
- **Description**: List all concerts with optional filtering
- **Query Parameters**:
  - `date` (optional): Filter by date (YYYY-MM-DD)
  - `venue` (optional): Filter by venue name (case-insensitive)
  - `artist` (optional): Filter by artist name (case-insensitive)
  - `page` (optional): Pagination (default: 1, size: 20)
- **Response**:
  ```json
  {
    "total": 554,
    "page": 1,
    "pageSize": 20,
    "data": [
      {
        "date": "31-Dec-2025",
        "time": "10:00",
        "venue_name": "Arkay Convention Center",
        "artist_names": ["S R Vinay", "Siva Teja", "Puttur T Nikshith"]
      }
    ]
  }
  ```

##### `GET /api/concerts/:id`
- **Description**: Get concert details by ID
- **Response**: Single concert object

##### `GET /api/venues`
- **Description**: List all unique venues
- **Response**:
  ```json
  {
    "total": 150,
    "venues": ["Arkay Convention Center", "Kartik Fine Arts", ...]
  }
  ```

##### `GET /api/artists`
- **Description**: List all unique artists
- **Response**:
  ```json
  {
    "total": 300,
    "artists": ["S R Vinay", "Prithvi Harish", ...]
  }
  ```

##### `GET /api/artists/:name/concerts`
- **Description**: Get all concerts by a specific artist name
- **Path Parameters**:
  - `name`: Artist name (URL-encoded, case-insensitive search)
- **Query Parameters**:
  - `page` (optional): Pagination (default: 1, size: 20)
  - `sortBy` (optional): Sort field - "date", "time", "venue" (default: "date")
  - `order` (optional): Sort order - "asc", "desc" (default: "asc")
- **Response**:
  ```json
  {
    "artist": "S R Vinay",
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "data": [
      {
        "date": "31-Dec-2025",
        "time": "10:00",
        "venue_name": "Arkay Convention Center",
        "artist_names": ["S R Vinay", "Siva Teja", "Puttur T Nikshith"]
      }
    ]
  }
  ```

##### `GET /api/venues/:name/concerts`
- **Description**: Get all concerts at a specific venue
- **Path Parameters**:
  - `name`: Venue name (URL-encoded, case-insensitive search)
- **Query Parameters**:
  - `page` (optional): Pagination (default: 1, size: 20)
  - `sortBy` (optional): Sort field - "date", "time", "artist" (default: "date")
  - `order` (optional): Sort order - "asc", "desc" (default: "asc")
- **Response**:
  ```json
  {
    "venue": "Arkay Convention Center",
    "total": 15,
    "page": 1,
    "pageSize": 20,
    "data": [
      {
        "date": "31-Dec-2025",
        "time": "10:00",
        "venue_name": "Arkay Convention Center",
        "artist_names": ["S R Vinay", "Siva Teja", "Puttur T Nikshith"]
      }
    ]
  }
  ```

##### `GET /api/schedule/by-date`
- **Description**: Get concerts grouped by date
- **Query Parameters**:
  - `startDate` (optional): YYYY-MM-DD
  - `endDate` (optional): YYYY-MM-DD
- **Response**:
  ```json
  {
    "2025-12-31": [
      { "time": "10:00", "venue": "...", "artists": [...] },
      { "time": "10:15", "venue": "...", "artists": [...] }
    ]
  }
  ```

---

### 3. Frontend Web Application
**Framework**: Express + EJS (or Next.js for SPA)

#### Pages

##### `/` - Home / Search
- Display featured concerts
- Search by:
  - Date (date picker)
  - Venue (dropdown or autocomplete)
  - Artist (text search)
- Display recent/upcoming concerts

##### `/concerts` - Concert Listing
- Paginated list of all concerts
- Sortable by date, venue, artist
- Filter sidebar with counters

##### `/concerts/:id` - Concert Detail
- Full concert information
- Venue address and contact
- All performing artists with instrument roles
- Related concerts at same venue

##### `/venues` - Venues Directory
- List of all concert venues
- Concerts at each venue
- Venue contact/address info

##### `/artists` - Artists Directory
- List of all performing artists
- Their concert schedule
- Instrument specialization (if available)

---

## Data Schema

### Concert Entry
```json
{
  "id": "unique_identifier",
  "date": "31-Dec-2025",
  "time": "10:00",
  "time_12h": "10:00 AM",
  "venue_name": "Arkay Convention Center",
  "venue_address": "Mylapore, Chennai",
  "artist_names": [
    "S R Vinay",
    "Siva Teja",
    "Puttur T Nikshith"
  ],
  "artist_details": [
    { "name": "S R Vinay", "instrument": "Vocal" },
    { "name": "Siva Teja", "instrument": "Violin" },
    { "name": "Puttur T Nikshith", "instrument": "Mridangam" }
  ]
}
```

---

## File Structure
```
icarnatic/
├── spec.md                    # This file
├── package.json               # Node.js dependencies
├── scraper.js                 # Web scraper (Puppeteer)
├── parse_local.js             # Local HTML parser (Cheerio)
├── server.js                  # Express API server
├── frontend/
│   ├── app.js                 # Frontend entry point
│   ├── routes/
│   │   ├── home.js
│   │   ├── concerts.js
│   │   └── search.js
│   ├── views/
│   │   ├── layout.ejs
│   │   ├── home.ejs
│   │   ├── concerts.ejs
│   │   └── concert-detail.ejs
│   └── public/
│       ├── css/
│       ├── js/
│       └── images/
├── backend/
│   ├── api.js                 # Express API server
│   ├── routes/
│   │   ├── concerts.js
│   │   ├── venues.js
│   │   └── artists.js
│   ├── controllers/
│   │   ├── concertController.js
│   │   ├── venueController.js
│   │   └── artistController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── auth.js
│   └── utils/
│       ├── dataLoader.js
│       └── filters.js
├── data/
│   ├── season2025.json        # Scraped data
│   └── parsed_schedule.json   # Parsed local data
├── pages/
│   ├── page_1.html
│   ├── page_2.html
│   └── ...
└── scrape.sh                  # Shell script for scraping
```

---

## Workflows

### 1. Data Collection Workflow
```
1. Run scraper → season2025.json
   npm run scrape

2. Or parse local HTMLs → parsed_schedule.json
   npm run parse

3. Data is loaded into memory by backend on startup
```

### 2. API Request Flow
```
Client Request
    ↓
Express Middleware (logging, auth)
    ↓
Route Handler
    ↓
Controller (business logic)
    ↓
Data Query/Filter
    ↓
JSON Response
```

### 3. Frontend Request Flow
```
User Action (search, filter)
    ↓
Form Submission / Fetch API
    ↓
Backend API Endpoint
    ↓
Response JSON
    ↓
Render Template / Update DOM
    ↓
Display Results
```

---

## Key Features

### Search & Filtering
- **By Date**: Date range picker
- **By Venue**: Dropdown with venue list
- **By Artist**: Text search with autocomplete
- **Combined Filters**: AND logic (date AND venue AND artist)

### Pagination
- 20 concerts per page (configurable)
- Previous/Next navigation
- Direct page jump
- Total count display

### Performance
- In-memory JSON data (no database required)
- Server-side filtering for API
- Client-side caching with ETags
- Gzip compression for responses

### Accessibility
- Semantic HTML
- ARIA labels for form controls
- Keyboard navigation support
- Mobile-responsive design

---

## Dependencies

### Production
```json
{
  "express": "^4.18.0",
  "cheerio": "^1.1.2",
  "puppeteer": "^24.34.0",
  "ejs": "^3.1.10",
  "body-parser": "^1.20.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0"
}
```

### Development
```json
{
  "nodemon": "^3.0.0",
  "eslint": "^8.0.0",
  "jest": "^29.0.0",
  "supertest": "^6.3.0"
}
```

---

## Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "scrape": "node scraper.js",
  "parse": "node parse_local.js",
  "api": "node backend/api.js",
  "frontend": "node frontend/app.js",
  "test": "jest",
  "lint": "eslint ."
}
```

---

## Deployment

### Local Development
```bash
npm install
npm run parse        # Load data from local HTML files
npm run dev          # Start with nodemon
```

### Production
```bash
npm install
npm run parse        # Or npm run scrape
npm start            # Start Express server
```

### Environment Variables
```
NODE_ENV=production
PORT=3000
API_PORT=3001
DEBUG=false
CORS_ORIGIN=https://example.com
CACHE_TTL=3600
```

---

## Testing

### Unit Tests
- Data parsing correctness
- Filter logic
- Time conversion

### Integration Tests
- API endpoint responses
- Filtering combinations
- Pagination

### E2E Tests
- Homepage load
- Search functionality
- Concert detail page
- Mobile responsiveness

---

## Future Enhancements

1. **Database Integration**: Replace JSON with MongoDB/PostgreSQL for scalability
2. **User Accounts**: Favorites, watchlist, notifications
3. **Calendar View**: Interactive calendar of concerts
4. **Artist Profiles**: Individual artist pages with bio
5. **Venue Information**: Maps integration, capacity, parking
6. **Ticket Links**: Direct booking integration
7. **Push Notifications**: Upcoming concert alerts
8. **Multi-language Support**: Tamil, English, etc.
9. **API Authentication**: JWT/API key for third-party access
10. **Analytics**: Concert popularity, search trends

---

## Maintenance

### Data Updates
- Re-run scraper weekly or on demand
- Parse updates from official iCarnatic website
- Validate data quality before deployment

### Monitoring
- Error logging
- API response times
- User search queries
- Popular venues/artists

### Backup
- JSON data exports
- Version control for data snapshots
- Periodic backups

---

## Notes
- All timestamps use 24-hour format (00:00 - 23:59)
- Dates are stored as DD-MMM-YYYY but converted to ISO (YYYY-MM-DD) for API responses
- Artist names are cleaned (parentheses removed) during parsing
- Venue names extracted from bold `<b>` tags in concert details
