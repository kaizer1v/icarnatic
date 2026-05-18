import { parseDateTime, getEndTime } from '../App';
import { Calendar, Clock, Users, Search } from 'lucide-react';
import { useState } from 'react';
import { SelectButton } from './SelectButton';

export function ScheduleView({ events, mySchedule = [], onToggleSchedule }) {
  const [searchQuery, setSearchQuery] = useState('');
  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getDuration = (start, end) => {
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  // Group events by date
  const groupEventsByDate = () => {
    const grouped = {};

    const sortedEvents = [...events].sort((a, b) => {
      const dateA = parseDateTime(a.date, a.start_time || a.time);
      const dateB = parseDateTime(b.date, b.start_time || b.time);
      return dateB.getTime() - dateA.getTime(); // descending order (most recent first)
    });

    sortedEvents.forEach(event => {
      const eventDate = parseDateTime(event.date, event.start_time || event.time);
      const dateKey = formatDate(eventDate);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  };

  const isUpcoming = (date) => {
    return date.getTime() >= new Date().getTime();
  };

  const isPast = (date) => {
    return date.getTime() < new Date().getTime();
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

  // Filter events based on search query
  const filterEvents = (eventsList) => {
    if (!searchQuery.trim()) return eventsList;

    const query = searchQuery.toLowerCase();
    return eventsList.filter(event => {
      const venueName = event.venue_name?.toLowerCase() || '';
      const artistNames = event.artist_names?.join(' ').toLowerCase() || '';
      const date = event.date?.toLowerCase() || '';
      const time = (event.start_time || event.time)?.toLowerCase() || '';
      const city = event.city?.toLowerCase() || '';

      return venueName.includes(query) ||
             artistNames.includes(query) ||
             date.includes(query) ||
             time.includes(query) ||
             city.includes(query);
    });
  };

  const filteredEvents = filterEvents(events);
  const groupedEvents = groupEventsByDate();
  const dateKeys = Object.keys(groupedEvents);

  // Filter grouped events based on search
  const filteredGroupedEvents = {};
  dateKeys.forEach(dateKey => {
    const filtered = filterEvents(groupedEvents[dateKey]);
    if (filtered.length > 0) {
      filteredGroupedEvents[dateKey] = filtered;
    }
  });
  const filteredDateKeys = Object.keys(filteredGroupedEvents);

  // Scroll to date section
  const scrollToDate = (dateKey) => {
    const element = document.getElementById(`date-${dateKey}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="h-full overflow-auto bg-gray-50 relative">
      {/* Floating Date Index - Desktop Only */}
      {filteredDateKeys.length > 0 && (
        <div className="hidden xl:block fixed left-4 top-24 bg-white rounded-lg shadow-lg p-4 max-h-[calc(100vh-120px)] overflow-y-auto z-10 w-48">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Jump</h4>
          <div className="space-y-1">
            {filteredDateKeys.map((dateKey) => {
              const dayEvents = filteredGroupedEvents[dateKey];
              const firstEventDate = parseDateTime(dayEvents[0].date, dayEvents[0].start_time || dayEvents[0].time);
              const dateStr = firstEventDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });

              return (
                <button
                  key={dateKey}
                  onClick={() => scrollToDate(dateKey)}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <div>
                    <div className="font-medium">{dateStr}</div>
                    <div className="text-xs text-gray-500">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        {/* Header with Search Bar */}
        <div className="sticky top-0 z-20 bg-gray-50 pb-3 sm:pb-4 mb-4 sm:mb-6">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Schedule</h2>
            <p className="text-sm sm:text-base text-gray-600">All upcoming and past events</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, venues, or artists..."
              className="w-full pl-9 sm:pl-10 pr-10 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-target"
              >
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Search Results Count */}
          {searchQuery && (
            <div className="mt-2 text-xs sm:text-sm text-gray-600">
              Found {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </div>
          )}
        </div>

        {filteredDateKeys.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <Calendar className="w-12 sm:w-16 h-12 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No matching events found' : 'No events scheduled'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchQuery ? 'Try adjusting your search terms' : 'Your calendar is empty'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredDateKeys.map((dateKey, dateIndex) => {
              const dayEvents = filteredGroupedEvents[dateKey];
              const firstEventDate = parseDateTime(dayEvents[0].date, dayEvents[0].start_time || dayEvents[0].time);
              const upcoming = isUpcoming(firstEventDate);

              return (
                <div key={dateKey} id={`date-${dateKey}`} className="scroll-mt-20 sm:scroll-mt-32">
                  {/* Date separator box */}
                  <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-4 sm:p-6 mb-3 sm:mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-blue-500 rounded-lg p-1.5 sm:p-2 flex-shrink-0">
                          <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                            {dateKey}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {upcoming && (
                        <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium flex-shrink-0">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Events list */}
                  <div className="space-y-2 sm:space-y-3 ml-2 sm:ml-4">
                    {dayEvents.map((event) => {
                      const startTime = parseDateTime(event.date, event.start_time || event.time);
                      const endTime = getEndTime(event);
                      const past = isPast(endTime);
                      const color = getVenueColor(event.venue_name);

                      return (
                        <div
                          key={event.id}
                          className={`bg-white rounded-lg shadow-sm p-3 sm:p-4 border-l-4 hover:shadow-md transition-shadow ${
                            past ? 'opacity-60' : ''
                          }`}
                          style={{ borderLeftColor: color }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 truncate">
                                {event.venue_name}
                              </h4>

                              <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                                {event.artist_names.length > 0 && (
                                  <div className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                    <Users className="w-3.5 sm:w-4 h-3.5 sm:h-4 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2">{event.artist_names.join(', ')}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                  <span>
                                    {formatTime(startTime)} - {formatTime(endTime)}
                                  </span>
                                </div>
                                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 rounded">
                                  {getDuration(startTime, endTime)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                              <SelectButton
                                eventId={event.id}
                                isSelected={mySchedule.includes(event.id)}
                                onToggle={onToggleSchedule}
                                size="sm"
                              />
                              <div
                                className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Separator line between dates (except for last date) */}
                  {dateIndex < filteredDateKeys.length - 1 && (
                    <div className="mt-4 sm:mt-6 border-t-2 border-gray-200"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
