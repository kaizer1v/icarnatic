import { parseDateTime, getEndTime, getEventColor } from '../App';
import { Calendar, Clock, Users } from 'lucide-react';

export function ScheduleView({ events }) {
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
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
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
      const dateA = parseDateTime(a.date, a.time);
      const dateB = parseDateTime(b.date, b.time);
      return dateA.getTime() - dateB.getTime();
    });
    
    sortedEvents.forEach(event => {
      const eventDate = parseDateTime(event.date, event.time);
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

  const groupedEvents = groupEventsByDate();
  const dateKeys = Object.keys(groupedEvents);

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule</h2>
          <p className="text-gray-600">All upcoming and past events</p>
        </div>

        {dateKeys.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events scheduled</h3>
            <p className="text-gray-600">Your calendar is empty</p>
          </div>
        ) : (
          <div className="space-y-8">
            {dateKeys.map((dateKey) => {
              const dayEvents = groupedEvents[dateKey];
              const firstEventDate = parseDateTime(dayEvents[0].date, dayEvents[0].time);
              const upcoming = isUpcoming(firstEventDate);

              return (
                <div key={dateKey} className="space-y-3">
                  {/* Date header */}
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {dateKey}
                    </h3>
                    {upcoming && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        Upcoming
                      </span>
                    )}
                  </div>

                  {/* Events list */}
                  <div className="space-y-2">
                    {dayEvents.map((event) => {
                      const startTime = parseDateTime(event.date, event.time);
                      const endTime = getEndTime(startTime);
                      const past = isPast(endTime);
                      const color = getEventColor(events.indexOf(event));

                      return (
                        <div
                          key={event.id}
                          className={`bg-white rounded-lg shadow-sm p-4 border-l-4 hover:shadow-md transition-shadow ${
                            past ? 'opacity-60' : ''
                          }`}
                          style={{ borderLeftColor: color }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {event.venue_name}
                              </h4>
                              
                              <div className="space-y-2 mb-3">
                                {event.artist_names.length > 0 && (
                                  <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{event.artist_names.join(', ')}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {formatTime(startTime)} - {formatTime(endTime)}
                                  </span>
                                </div>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                  {getDuration(startTime, endTime)}
                                </span>
                              </div>
                            </div>
                            <div
                              className="w-3 h-3 rounded-full mt-1"
                              style={{ backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
