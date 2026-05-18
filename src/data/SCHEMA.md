# Event Data Schema

This document describes the structure of events stored in `events.json`.

## Overview

The `events.json` file contains an array of event objects representing Carnatic music concerts, recitals, and performances across various venues.

## Event Object Schema

Each event object has the following structure:

```json
{
  "id": "string (UUID v4)",
  "date": "string (DD-MMM-YYYY format, e.g., '15-May-2026')",
  "start_time": "string (HH:MM format in 24-hour notation, e.g., '18:00')",
  "end_time": "string (HH:MM format in 24-hour notation, e.g., '19:00')",
  "venue_name": "string (name and optionally address of the venue)",
  "city": "string | null (extracted city name from venue, null if not available)",
  "event_title": "string (generated title or description of the event)",
  "artist_names": "array of strings (list of performing artists)",
  "event_price": "number (ticket price as float, e.g., 1.00)",
  "event_price_currency": "string (currency identifier, e.g., 'rupee')"
}
```

## Field Descriptions

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | `string` | Unique identifier for the event (UUID v4) | `"9b5e2226-bf69-47a8-b122-762779ddff07"` |
| `date` | `string` | Event date in DD-MMM-YYYY format | `"15-May-2026"` |
| `start_time` | `string` | Event start time in 24-hour HH:MM format | `"18:00"` |
| `end_time` | `string` | Event end time in 24-hour HH:MM format | `"19:00"` |
| `venue_name` | `string` | Full name of the venue (may include address) | `"Mudaliar Sangham Convention Hall, Osborne road, Bangalore"` |
| `event_title` | `string` | Title or type of the event | `"Vocal Concert"`, `"S R Vinay - Concert"` |
| `artist_names` | `array` | List of performing artists (may be empty) | `["Sri. Sid Sriram", "Sri. H N Bhaskar"]` |
| `event_price` | `number` | Ticket price as a decimal number | `1.00` |
| `event_price_currency` | `string` | Currency for the event price | `"rupee"` |

### Nullable Fields

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| `city` | `string \| null` | City name extracted from venue_name | Null if city cannot be extracted from venue name |

## Field Generation Rules

### `event_title`
Generated using the following priority:
1. If venue_name contains specific event types (e.g., "Vocal Concert", "Veena Recital"), use that
2. If artist_names array has entries, use first artist name + " - Concert"
3. Default fallback: "Carnatic Music Concert"

### `city`
Automatically extracted from `venue_name` if it contains recognized Indian city names (Bangalore, Chennai, Mumbai, etc.). Set to `null` if no city can be extracted.

### `end_time`
Currently calculated as `start_time + 1 hour`. Can be manually adjusted for events with different durations.

## Date Format Details

### Date Field (`date`)
- Format: `DD-MMM-YYYY`
- Day: Two digits (01-31)
- Month: Three-letter abbreviation (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec)
- Year: Four digits
- Separator: Hyphen (-)
- Examples: `"15-May-2026"`, `"31-Dec-2025"`

### Time Fields (`start_time`, `end_time`)
- Format: `HH:MM`
- 24-hour notation
- Hours: Two digits (00-23)
- Minutes: Two digits (00-59)
- Separator: Colon (:)
- Examples: `"18:00"`, `"16:00"`, `"10:00"`

## Example Event

```json
{
  "id": "e566ec0e-2c0b-483a-b77e-ef785300c3da",
  "date": "13-May-2026",
  "start_time": "18:00",
  "end_time": "19:00",
  "venue_name": "Mudaliar Sangham Convention Hall, Osborne road, Bangalore",
  "city": "Bangalore",
  "event_title": "Vocal Concert",
  "artist_names": [
    "Sri. Sid Sriram",
    "Sri. H N Bhaskar",
    "Sri. J Vaidyanathan",
    "Dr. S. Karthick"
  ],
  "event_price": 1.00,
  "event_price_currency": "rupee"
}
```

## Common City Values

Cities that are automatically extracted from venue names include (but are not limited to):
- Bangalore / Bengaluru
- Chennai
- Mumbai
- Delhi
- Hyderabad
- Pune
- Kolkata
- And other major Indian cities

## Data Validation Rules

1. **ID**: Must be a valid UUID v4 string
2. **Date**: Must follow DD-MMM-YYYY format with valid month abbreviations
3. **Time**: Must follow HH:MM format in 24-hour notation (00:00 to 23:59)
4. **Event Price**: Must be a positive number (float)
5. **Artist Names**: Must be an array (can be empty)
6. **City**: Can be null or a string
7. **End Time**: Should be after or equal to start_time

## Usage Notes

- All times are in local time zone (venue location)
- Event price of `1.00` is currently a placeholder value
- Currency is stored as a string identifier rather than symbol for better compatibility
- The schema is designed to be easily parsed by both humans and machines
- Events are stored in a flat array structure (not grouped by date or venue)

## Version History

- **v2.0** (2026-05-18): Added `event_title`, `event_price`, `event_price_currency` fields
- **v1.1** (2026-05-18): Added `city` field and renamed `time` to `start_time`, added `end_time`
- **v1.0** (Initial): Basic event structure with date, time, venue, and artists
