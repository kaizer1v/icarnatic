import { parseDateTime, getEndTime } from '../App';
import { toast } from 'sonner';

/**
 * Formats a date for ICS file format (e.g., "20251231T100000Z")
 */
function formatICSDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapes special characters for ICS format
 */
function escapeICSText(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Export events to ICS calendar file format
 * Compatible with Google Calendar, Outlook, Apple Calendar
 */
export function exportToICS(events) {
  if (events.length === 0) {
    toast.error('No events to export');
    return;
  }

  try {
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//iCarnatic//Event Calendar//EN',
      'CALNAME:My Carnatic Music Schedule',
      'X-WR-CALNAME:My Carnatic Music Schedule',
      'X-WR-TIMEZONE:Asia/Kolkata',
    ];

    events.forEach(event => {
      const startDate = parseDateTime(event.date, event.time);
      const endDate = getEndTime(startDate);

      // Create description with artist names
      const artistList = event.artist_names.length > 0
        ? event.artist_names.join(', ')
        : 'Artists TBA';

      icsLines.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@icarnatic.app`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${escapeICSText(event.venue_name)}`,
        `DESCRIPTION:${escapeICSText(`Artists: ${artistList}`)}`,
        `LOCATION:${escapeICSText(event.venue_name)}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT'
      );
    });

    icsLines.push('END:VCALENDAR');

    // Create blob and download
    const icsContent = icsLines.join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carnatic-schedule-${new Date().toISOString().split('T')[0]}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded ${events.length} event${events.length !== 1 ? 's' : ''} as calendar file`);
  } catch (error) {
    console.error('Failed to export ICS:', error);
    toast.error('Failed to export calendar file');
  }
}

/**
 * Export events to plain text format for messaging apps
 * Returns the text string
 */
export function exportToText(events) {
  if (events.length === 0) {
    return '';
  }

  const lines = [
    '🎵 My Carnatic Music Schedule',
    `📅 ${events.length} event${events.length !== 1 ? 's' : ''} selected`,
    '',
  ];

  // Group by date
  const grouped = events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    const dateA = parseDateTime(a, '00:00');
    const dateB = parseDateTime(b, '00:00');
    return dateA - dateB;
  });

  sortedDates.forEach((date) => {
    const dateEvents = grouped[date].sort((a, b) => {
      const timeA = parseDateTime(a.date, a.time);
      const timeB = parseDateTime(b.date, b.time);
      return timeA - timeB;
    });

    lines.push(`📆 ${date}`);
    dateEvents.forEach(event => {
      lines.push(`  ⏰ ${event.time} - ${event.venue_name}`);
      if (event.artist_names.length > 0) {
        lines.push(`     🎤 ${event.artist_names.join(', ')}`);
      }
    });
    lines.push('');
  });

  lines.push('✨ Created with iCarnatic Event Calendar');

  return lines.join('\n');
}

/**
 * Share schedule using native share API or clipboard
 * Works on mobile and desktop
 */
export async function shareSchedule(events) {
  if (events.length === 0) {
    toast.error('No events to share');
    return;
  }

  const text = exportToText(events);

  // Try native share API first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'My Carnatic Music Schedule',
        text: text,
      });
      toast.success('Shared successfully!');
      return;
    } catch (err) {
      // User cancelled or error - fallback to copy
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Schedule copied to clipboard! Share it on WhatsApp, Telegram, or any messaging app.');
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    toast.error('Failed to copy to clipboard');
  }
}
