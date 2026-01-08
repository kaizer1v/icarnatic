import { useState } from 'react';
import { Calendar } from './components/Calendar';
import eventsData from '../data/clean_events.json';

const all_months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// Helper function to parse date and time
export const parseDateTime = (dateStr, timeStr) => {
  const [day, month, year] = dateStr.split('-');
  const dayNum = Number(day);
  const monthNum = all_months.indexOf(month.toLowerCase()) + 1;
  const yearNum = Number(year);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month, day, hours, minutes || 0);
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

  return (
    <div className="size-full bg-gray-50">
      <Calendar
        events={events}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </div>
  );
}
