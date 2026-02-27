import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Calendar } from './components/Calendar';
import { useMySchedule } from './hooks/useMySchedule';
import eventsData from '../data/events.json';

const all_months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// Helper function to parse date and time
export const parseDateTime = (dateStr, timeStr) => {
  const [day, month, year] = dateStr.split('-');
  const dayNum = Number(day);
  const monthNum = all_months.indexOf(month.toLowerCase()); // 0-indexed for Date constructor
  const yearNum = Number(year);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(yearNum, monthNum, dayNum, hours, minutes || 0);
};

// Helper function to get event end time (default 1 hour duration)
export const getEndTime = (startTime) => {
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 1);
  return endTime;
};

// Helper function to get event color based on index
export const getEventColor = (index) => {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
  return colors[index % colors.length];
};

export default function App() {
  const [events] = useState(eventsData);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');

  // Schedule management
  const { mySchedule, addToSchedule, removeFromSchedule, isInSchedule } = useMySchedule();

  const handleToggleSchedule = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (isInSchedule(eventId)) {
      removeFromSchedule(eventId);
      toast.success(`Removed "${event.venue_name}" from your schedule`);
    } else {
      addToSchedule(eventId);
      toast.success(`Added "${event.venue_name}" to your schedule`);
    }
  };

  return (
    <div className="size-full bg-gray-50">
      <Toaster position="bottom-right" richColors />
      <Calendar
        events={events}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        mySchedule={mySchedule}
        onToggleSchedule={handleToggleSchedule}
      />
    </div>
  );
}
