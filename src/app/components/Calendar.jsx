import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { ScheduleView } from './ScheduleView';

export function Calendar({
  events,
  currentDate,
  onDateChange,
  viewMode,
  onViewModeChange,
}) {
  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    }
    onDateChange(newDate);
  };

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    }
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const getTitle = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      } else {
        return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      }
    } else {
      return 'Schedule';
    }
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if user is typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = event.key.toLowerCase();

      switch (key) {
        case 'w':
          onViewModeChange('week');
          break;
        case 'm':
          onViewModeChange('month');
          break;
        case 's':
          onViewModeChange('schedule');
          break;
        case 't':
          goToToday();
          break;
        case 'j':
          goToPreviousPeriod();
          break;
        case 'k':
          goToNextPeriod();
          break;
        default:
          return;
      }

      event.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewMode, currentDate, onViewModeChange, onDateChange]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPeriod}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={viewMode === 'schedule'}
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={goToNextPeriod}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={viewMode === 'schedule'}
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {getTitle()}
            </h2>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('month')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => onViewModeChange('week')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => onViewModeChange('schedule')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'schedule'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'month' && (
          <MonthView events={events} currentDate={currentDate} />
        )}
        {viewMode === 'week' && (
          <WeekView events={events} currentDate={currentDate} />
        )}
        {viewMode === 'schedule' && (
          <ScheduleView events={events} />
        )}
      </div>
    </div>
  );
}
