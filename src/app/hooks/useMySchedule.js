import { useState, useEffect, useMemo } from 'react';

export function useMySchedule() {
  // Initialize from localStorage
  const [mySchedule, setMySchedule] = useState(() => {
    try {
      const saved = localStorage.getItem('mySchedule');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load schedule from localStorage:', error);
      return [];
    }
  });

  // Sync to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('mySchedule', JSON.stringify(mySchedule));
    } catch (error) {
      console.error('Failed to save schedule to localStorage:', error);
    }
  }, [mySchedule]);

  // Listen for changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'mySchedule' && e.newValue) {
        try {
          setMySchedule(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to sync schedule from other tab:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper methods
  const addToSchedule = (eventId) => {
    setMySchedule(prev => {
      if (prev.includes(eventId)) return prev;
      return [...prev, eventId];
    });
  };

  const removeFromSchedule = (eventId) => {
    setMySchedule(prev => prev.filter(id => id !== eventId));
  };

  const isInSchedule = (eventId) => {
    return mySchedule.includes(eventId);
  };

  const clearSchedule = () => {
    setMySchedule([]);
  };

  // Optimized Set for O(1) lookup
  const scheduleSet = useMemo(() => new Set(mySchedule), [mySchedule]);
  const isInScheduleFast = (eventId) => scheduleSet.has(eventId);

  return {
    mySchedule,
    addToSchedule,
    removeFromSchedule,
    isInSchedule: isInScheduleFast,
    clearSchedule,
  };
}

// Utility to check if localStorage is available
export function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
