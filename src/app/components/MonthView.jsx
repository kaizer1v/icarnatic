import { parseDateTime } from '../App';
import { SelectButton } from './SelectButton';

export function MonthView({ events, currentDate, mySchedule = [], onToggleSchedule }) {
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDay = (date) => {
    if (!date) return [];

    return events.filter(event => {
      const eventDate = parseDateTime(event.date, event.time);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date) => {
    if (!date) return false;
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

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-sm font-semibold text-gray-600 border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((date, index) => {
          const dayEvents = getEventsForDay(date);
          const today = isToday(date);

          return (
            <div
              key={index}
              className="border-r border-b last:border-r-0 p-2 min-h-[120px] bg-white hover:bg-gray-50 transition-colors"
            >
              {date && (
                <>
                  <div className="flex justify-end mb-1">
                    <span
                      className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                        today
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const color = getVenueColor(event.venue_name);
                      return (
                        <div
                          key={event.id}
                          className="text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: color + '20', color: color }}
                          title={`${event.venue_name} - ${event.artist_names.join(', ')}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate flex-1">{event.venue_name}</span>
                            <SelectButton
                              eventId={event.id}
                              isSelected={mySchedule.includes(event.id)}
                              onToggle={onToggleSchedule}
                              size="sm"
                            />
                          </div>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
