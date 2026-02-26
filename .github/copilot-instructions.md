# Copilot Instructions for iCarnatic Calendar

## Project Overview

iCarnatic is a **React + Vite calendar application** displaying Carnatic music events across multiple venues. It's a code bundle generated from Figma designs with a focus on interactive calendar views (month, week, schedule) and event visualization.

**Key Stack:**
- React 18.3 + TypeScript/JSX mixed codebase
- Vite 6.3 with Tailwind CSS 4.1 + PostCSS
- Radix UI component library for accessible UI primitives
- Date manipulation via `date-fns` and custom date helpers
- Data: JSON-based event store (5700+ Carnatic music events)

---

## Architecture & Data Flow

### Component Structure

```
App.jsx (state manager)
  └── Calendar.jsx (view orchestrator)
      ├── MonthView.jsx (calendar grid layout)
      ├── WeekView.jsx (timeline-based hourly grid)
      └── ScheduleView.jsx (vertical list view)
```

**State Management Pattern:**
- `App.jsx` owns state: `events` (from JSON), `currentDate`, `viewMode`
- Props flow down; callbacks flow up via `on*` handlers
- No external state manager (Redux, Zustand) - keep it simple

### Date & Event Handling

**Critical Pattern in `App.jsx`:**
```javascript
// Date parsing from "31-Dec-2025" + "10:00" format
parseDateTime(dateStr, timeStr) → JavaScript Date object
// Event coloring by index (6-color cycle)
getEventColor(index) → hex color string
// Events default 1-hour duration
getEndTime(startTime) → Date + 1 hour
```

**Event Data Structure:**
```json
{
  "date": "31-Dec-2025",
  "time": "10:00",
  "venue_name": "String",
  "artist_names": ["Array", "of", "artists"],
  "id": "UUID"
}
```

### View-Specific Logic

- **MonthView**: Calendar grid, day-level event display, `"today"` highlighting
- **WeekView**: 7-day horizontal layout, hour-based positioning (complex Y-offset math), time labels
- **ScheduleView**: Vertical event list (implementation details TBD)

---

## Development Workflow

### Commands

```bash
npm i              # Install dependencies (Vite handles peer deps)
npm run dev        # Start dev server (Vite default port 5173)
npm run build      # Production build to /dist
```

### Key Conventions

1. **Naming:** Use `.jsx` for React components (not `.tsx`), even with TypeScript features
2. **Styling:** Tailwind utility classes only—avoid custom CSS except for animations/transitions
3. **Props:** Component prop drilling is acceptable at this scale; extract helper functions to `App.jsx`
4. **Imports:** Use `@` alias for `src/` (configured in `vite.config.ts`)

### Important: Figma Design Dependency

This is a **Figma code bundle**—refer to [original Figma design](https://www.figma.com/design/oHZ6rWT4tqVgepzoxDTx9i/Event-Calendar-View) for:
- Exact spacing, typography, color tokens
- Component interaction specifications
- Responsive breakpoint definitions

The design should be the **source of truth** for visual requirements.

---

## Common Tasks & Patterns

### Adding a New View Type

1. Create `src/app/components/NewView.jsx`
2. Import helper functions from `App.jsx` (`parseDateTime`, `getEventColor`)
3. Accept `{ events, currentDate }` props
4. Add case to `Calendar.jsx` rendering logic and view mode selector
5. Update title generation in `Calendar.jsx` if needed

### Modifying Event Filtering

- Event matching happens in view components (`getEventsForDay`, `getEventsForDate`)
- Always compare full date objects: `date.getDate()`, `getMonth()`, `getFullYear()` (time component often ignored)
- Clean event data is in `src/data/clean_events.json` (use this, not raw `events.json`)

### Date Navigation

- Month view: ±1 month via `setMonth()`
- Week view: ±7 days via `setDate()`
- **Both** disable nav when in schedule view

### Styling Buttons & Controls

- Primary action (e.g., "Today" button): `bg-blue-600 hover:bg-blue-700 text-white`
- Secondary (e.g., chevron buttons): `hover:bg-gray-100`
- Use Lucide React icons (`lucide-react` package) for consistent iconography

---

## Gotchas & Constraints

1. **React + Tailwind plugins required:** `vite.config.ts` explicitly requires both plugins for Make integration—do not remove even if unused

2. **Date parsing is fragile:** Format is strictly `"DD-Mon-YYYY"` (zero-padded day, 3-letter month abbreviation, 4-digit year). The app stores all_months array in App.jsx as source of truth

3. **Month calculation with new Date():** Use `setMonth(month - 1)` correctly; JavaScript months are 0-indexed

4. **Event color cycling:** Limited to 6 predefined colors; duplicate colors expected for events beyond index 6

5. **WeekView Y-positioning math:** Complex hour-to-pixel calculation—test edge cases (midnight, 23:00, partial hours)

---

## External Integrations

Per README notes, future architecture may involve:
- AWS Lambda for event scraping
- S3/Supabase for data storage
- EC2 + Nginx + ECS for scaling

**Current scope:** Frontend only, static data from JSON.

---

## Radix UI Integration

The `src/app/components/ui/` folder contains Radix UI primitives (accordion, dialog, select, etc.). Use as needed, but avoid over-engineering—current views use minimal UI library components.

**Example:** If adding a modal for event details, import and compose from `src/app/components/ui/dialog.tsx`.

---

## Questions for Clarity?

If any section is ambiguous, ask before implementing. The Figma design is the ultimate source of truth for visual behavior.
