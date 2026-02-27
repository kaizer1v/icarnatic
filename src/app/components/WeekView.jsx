import { parseDateTime, getEndTime } from '../App';
import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';

export function WeekView({ events, currentDate }) {
  const [activeEventId, setActiveEventId] = useState(null);
  const [showAllEvents, setShowAllEvents] = useState(true);
  const [selectedVenues, setSelectedVenues] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const getWeekDays = () => {
    const weekStart = new Date(currentDate);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day;
    weekStart.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = parseDateTime(event.date, event.time);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Get unique venues from all events
  const uniqueVenues = useMemo(() => {
    const venues = new Set();
    events.forEach(event => {
      if (event.venue_name) {
        venues.add(event.venue_name);
      }
    });
    return Array.from(venues).sort();
  }, [events]);

  // Toggle venue selection
  const toggleVenue = (venue) => {
    const newSelected = new Set(selectedVenues);
    if (newSelected.has(venue)) {
      newSelected.delete(venue);
    } else {
      newSelected.add(venue);
    }
    setSelectedVenues(newSelected);
  };

  // Filter events based on all criteria
  const filterEvents = (eventsList) => {
    return eventsList.filter(event => {
      // Show all events toggle
      if (!showAllEvents) {
        return false;
      }

      // Venue filter
      if (selectedVenues.size > 0 && !selectedVenues.has(event.venue_name)) {
        return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const venueName = event.venue_name?.toLowerCase() || '';
        const artistNames = event.artist_names?.join(' ').toLowerCase() || '';

        if (!venueName.includes(query) && !artistNames.includes(query)) {
          return false;
        }
      }

      return true;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Generate consistent color for venue name
  const getVenueColor = (venueName) => {
    const colors = [
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // green
      '#06b6d4', // cyan
      '#ef4444', // red
      '#f97316', // orange
      '#84cc16', // lime
      '#6366f1', // indigo
      '#14b8a6', // teal
      '#a855f7', // violet
    ];

    // Simple hash function for consistent colors
    let hash = 0;
    for (let i = 0; i < venueName.length; i++) {
      hash = venueName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getEventPosition = (event) => {
    const start = parseDateTime(event.date, event.time);
    const end = getEndTime(start);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const top = ((startHour - 0) / 24) * 100;
    const height = (duration / 24) * 100;

    return { top: `${top}%`, height: `${Math.max(height, 4)}%` };
  };

  // Check if two events have exact same start and end time
  const eventsHaveSameTime = (event1, event2) => {
    const start1 = parseDateTime(event1.date, event1.time);
    const end1 = getEndTime(start1);
    const start2 = parseDateTime(event2.date, event2.time);
    const end2 = getEndTime(start2);

    return start1.getTime() === start2.getTime() && end1.getTime() === end2.getTime();
  };

  // Calculate overlapping groups and positioning for each event
  const getOverlapLayout = (dayEvents) => {
    const layout = dayEvents.map((event, index) => ({
      event,
      index,
      column: 0,
      totalColumns: 1,
    }));

    // Find events with exact same time and assign columns
    for (let i = 0; i < dayEvents.length; i++) {
      const sameTimeEvents = [];
      for (let j = 0; j < dayEvents.length; j++) {
        if (i !== j && eventsHaveSameTime(dayEvents[i], dayEvents[j])) {
          sameTimeEvents.push(j);
        }
      }

      if (sameTimeEvents.length > 0) {
        // Calculate total columns needed for this exact time group
        const group = [i, ...sameTimeEvents].sort((a, b) => a - b);
        const maxColumns = group.length;

        // Assign columns to events in this group
        group.forEach((eventIdx, colIdx) => {
          if (layout[eventIdx].totalColumns < maxColumns) {
            layout[eventIdx].totalColumns = maxColumns;
            layout[eventIdx].column = colIdx;
          }
        });
      }
    }

    return layout;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const weekDays = getWeekDays();
  const weekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="h-full flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>

          {/* Show All Events Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllEvents}
                onChange={(e) => setShowAllEvents(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">Show All Events</span>
            </label>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Venue Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Filter by Venue
              </label>
              {selectedVenues.size > 0 && (
                <button
                  onClick={() => setSelectedVenues(new Set())}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uniqueVenues.map((venue) => (
                <label
                  key={venue}
                  className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedVenues.has(venue)}
                    onChange={() => toggleVenue(venue)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                  />
                  <span className="text-sm text-gray-700 flex-1">{venue}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {(selectedVenues.size > 0 || searchQuery) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Active Filters:</p>
              {selectedVenues.size > 0 && (
                <div className="text-xs text-gray-600 mb-1">
                  {selectedVenues.size} venue{selectedVenues.size !== 1 ? 's' : ''} selected
                </div>
              )}
              {searchQuery && (
                <div className="text-xs text-gray-600">
                  Search: "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-8 border-b bg-gray-50 sticky top-0 z-10">
          <div className="py-3 px-4 text-sm font-semibold text-gray-600 border-r">
            Time
          </div>
          {weekDays.map((date, index) => {
            const today = isToday(date);
            return (
              <div
                key={index}
                className="py-3 px-2 text-center border-r last:border-r-0"
              >
                <div className="text-xs text-gray-500 mb-1">
                  {weekDayNames[date.getDay()].slice(0, 3)}
                </div>
                <div
                  className={`text-lg font-semibold inline-flex items-center justify-center w-9 h-9 rounded-full ${
                    today
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8">
            {/* Time labels */}
            <div className="border-r">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b px-2 py-1 text-xs text-gray-500 text-right"
                >
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((date, dayIndex) => {
              const dayEvents = getEventsForDay(date);
              const filteredDayEvents = filterEvents(dayEvents);
              const layout = getOverlapLayout(filteredDayEvents);

              return (
                <div
                  key={dayIndex}
                  className="border-r last:border-r-0 relative"
                  onClick={() => setActiveEventId(null)}
                >
                  {/* Hour lines */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-16 border-b hover:bg-gray-50 transition-colors"
                    />
                  ))}

                  {/* Events */}
                  <div className="absolute inset-0 pointer-events-none">
                    {layout.map(({ event, column, totalColumns }, layoutIndex) => {
                      const { top, height } = getEventPosition(event);
                      const start = parseDateTime(event.date, event.time);
                      const end = getEndTime(start);
                      const color = getVenueColor(event.venue_name);
                      const isActive = activeEventId === event.id;

                      // Calculate width and left position based on overlap
                      // When active, expand to full width
                      const columnWidth = isActive ? 100 : (100 / totalColumns);
                      const leftPercent = isActive ? 0 : (column * columnWidth);
                      const widthPercent = isActive ? 100 : (columnWidth - (totalColumns > 1 ? 5 : 0)); // 5% gap between overlapping events

                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveEventId(isActive ? null : event.id);
                          }}
                          className="absolute rounded-lg p-2 pointer-events-auto cursor-pointer transition-all overflow-hidden shadow-sm hover:shadow-lg"
                          style={{
                            top,
                            height,
                            left: isActive ? '4px' : `calc(${leftPercent}% + 4px)`,
                            width: isActive ? 'calc(100% - 8px)' : `calc(${widthPercent}% - 4px)`,
                            backgroundColor: color,
                            minHeight: '40px',
                            zIndex: isActive ? 100 : 10 + layoutIndex,
                            opacity: isActive ? 1 : 0.95,
                            border: isActive ? '2px solid rgba(255, 255, 255, 0.9)' : '1px solid rgba(255, 255, 255, 0.3)',
                          }}
                        >
                          <div className={`text-xs font-semibold text-white mb-1 ${!isActive && totalColumns > 2 ? 'truncate' : ''}`}>
                            {event.venue_name}
                          </div>
                          <div className="text-xs text-white opacity-90">
                            {formatTime(start)} - {formatTime(end)}
                          </div>
                          {event.artist_names.length > 0 && (isActive || totalColumns <= 2) && (
                            <div className={`text-xs text-white opacity-80 ${isActive ? '' : 'truncate'}`}>
                              {event.artist_names.join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
