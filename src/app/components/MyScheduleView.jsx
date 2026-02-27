import { parseDateTime, getEndTime } from '../App';
import { Calendar, Clock, Users, Star, Download, Share2, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { SelectButton } from './SelectButton';
import { exportToICS, exportToText, shareSchedule } from '../utils/exportSchedule';
import { toast } from 'sonner';

export function MyScheduleView({ events, mySchedule, onToggleSchedule }) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter events to only show selected ones
  const selectedEvents = events.filter(e => mySchedule.includes(e.id));

  // Check for stale event IDs
  const staleCount = mySchedule.length - selectedEvents.length;

  const formatDate = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getDuration = (startTime, endTime) => {
    const diff = endTime - startTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
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

    let hash = 0;
    for (let i = 0; i < venueName.length; i++) {
      hash = venueName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const isPast = (date) => {
    return date < new Date();
  };

  // Group events by date
  const groupedEvents = selectedEvents.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    const dateA = parseDateTime(a, '00:00');
    const dateB = parseDateTime(b, '00:00');
    return dateA - dateB;
  });

  const handleClearAll = () => {
    if (showClearConfirm) {
      // Clear the schedule
      mySchedule.forEach(id => onToggleSchedule(id));
      setShowClearConfirm(false);
      toast.success('All events removed from your schedule');
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const cleanupStaleIds = () => {
    const staleIds = mySchedule.filter(id => !events.find(e => e.id === id));
    staleIds.forEach(id => onToggleSchedule(id));
    toast.success(`Removed ${staleIds.length} unavailable event(s)`);
  };

  // Empty state
  if (selectedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <Star className="w-16 h-16 mb-4 opacity-20" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold mb-2 text-gray-700">No Events in Your Schedule</h3>
        <p className="text-sm text-center max-w-md">
          Click the star icon on any event in Month, Week, or Schedule views to add it to your personal schedule
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header with actions */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">My Schedule</h2>
            <p className="text-sm text-gray-600">{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => exportToICS(selectedEvents)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Download as .ics calendar file"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={() => shareSchedule(selectedEvents)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Share as text (WhatsApp, Telegram, etc.)"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={handleClearAll}
              className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-lg transition-colors ${
                showClearConfirm
                  ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              title={showClearConfirm ? 'Click again to confirm' : 'Remove all events from schedule'}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{showClearConfirm ? 'Confirm?' : 'Clear All'}</span>
            </button>
          </div>
        </div>

        {/* Stale IDs warning */}
        {staleCount > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-700">
                  {staleCount} event{staleCount !== 1 ? 's' : ''} in your schedule {staleCount !== 1 ? 'are' : 'is'} no longer available.
                </p>
                <button
                  onClick={cleanupStaleIds}
                  className="text-sm text-yellow-800 underline hover:text-yellow-900 mt-1"
                >
                  Remove {staleCount !== 1 ? 'them' : 'it'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {sortedDates.map((date, dateIndex) => {
            const dateEvents = groupedEvents[date].sort((a, b) => {
              const timeA = parseDateTime(a.date, a.time);
              const timeB = parseDateTime(b.date, b.time);
              return timeA - timeB;
            });

            const eventDate = parseDateTime(date, '00:00');
            const isUpcoming = !isPast(eventDate);

            return (
              <div key={date}>
                {/* Date Header */}
                <div className="sticky top-0 bg-gray-50 py-3 z-10 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formatDate(eventDate)}
                  </h3>
                  {isUpcoming && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Events for this date */}
                <div className="space-y-4 mt-2">
                  {dateEvents.map((event) => {
                    const startTime = parseDateTime(event.date, event.time);
                    const endTime = getEndTime(startTime);
                    const past = isPast(endTime);
                    const color = getVenueColor(event.venue_name);

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
                          <div className="flex items-center gap-2">
                            <SelectButton
                              eventId={event.id}
                              isSelected={true}
                              onToggle={onToggleSchedule}
                              size="sm"
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Separator line between dates (except for last date) */}
                {dateIndex < sortedDates.length - 1 && (
                  <div className="border-t border-gray-200 my-6" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
