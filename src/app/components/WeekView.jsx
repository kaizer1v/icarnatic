import { parseDateTime, getEndTime, getEventColor } from '../App';

export function WeekView({ events, currentDate }) {
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

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
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

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const weekDays = getWeekDays();
  const weekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="h-full flex flex-col">
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
            
            return (
              <div key={dayIndex} className="border-r last:border-r-0 relative">
                {/* Hour lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-16 border-b hover:bg-gray-50 transition-colors"
                  />
                ))}

                {/* Events */}
                <div className="absolute inset-0 pointer-events-none">
                  {dayEvents.map((event) => {
                    const { top, height } = getEventPosition(event);
                    const start = parseDateTime(event.date, event.time);
                    const end = getEndTime(start);
                    const color = getEventColor(events.indexOf(event));
                    
                    return (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 rounded-lg p-2 pointer-events-auto cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
                        style={{
                          top,
                          height,
                          backgroundColor: color,
                          minHeight: '40px',
                        }}
                      >
                        <div className="text-xs font-semibold text-white mb-1">
                          {event.venue_name}
                        </div>
                        <div className="text-xs text-white opacity-90">
                          {formatTime(start)} - {formatTime(end)}
                        </div>
                        {event.artist_names.length > 0 && (
                          <div className="text-xs text-white opacity-80 truncate">
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
  );
}
