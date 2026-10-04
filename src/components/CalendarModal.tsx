import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // "DD.MM.YYYY"
  onSelectDate: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const WEEK_DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}) => {
  if (!isOpen) return null;

  // Parse selected date or fallback to current / 16.05.2025
  const parseDate = (str: string) => {
    const parts = str.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return new Date(2025, 4, 16);
  };

  const initialDate = parseDate(selectedDate);
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Build calendar matrix (Sunday to Saturday)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: 'prev',
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    calendarDays.push({
      day: d,
      month: 'current',
    });
  }

  // Next month leading days (fill up to multiple of 7)
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining && calendarDays.length < 35; d++) {
    calendarDays.push({
      day: d,
      month: 'next',
    });
  }

  const handleDayClick = (item: { day: number; month: string }) => {
    let targetMonth = currentMonth;
    let targetYear = currentYear;

    if (item.month === 'prev') {
      if (currentMonth === 0) {
        targetMonth = 11;
        targetYear -= 1;
      } else {
        targetMonth -= 1;
      }
    } else if (item.month === 'next') {
      if (currentMonth === 11) {
        targetMonth = 0;
        targetYear += 1;
      } else {
        targetMonth += 1;
      }
    }

    setSelectedDay(item.day);
    const dayStr = String(item.day).padStart(2, '0');
    const monthStr = String(targetMonth + 1).padStart(2, '0');
    const formatted = `${dayStr}.${monthStr}.${targetYear}`;
    onSelectDate(formatted);
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[320px] bg-white rounded-xl shadow-2xl overflow-hidden border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Poprzedni miesiąc"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-semibold tracking-wider text-neutral-700">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Następny miesiąc"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center pt-3 pb-1 border-b border-neutral-50 text-[11px] font-semibold text-neutral-500 tracking-wider">
          {WEEK_DAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells grid */}
        <div className="grid grid-cols-7 p-2 text-center text-sm gap-y-1">
          {calendarDays.map((item, idx) => {
            const isCurrent = item.month === 'current';
            const isSelected = isCurrent && item.day === selectedDay;

            return (
              <div key={idx} className="flex items-center justify-center py-1">
                <button
                  type="button"
                  onClick={() => handleDayClick(item)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#2196F3] text-white shadow-sm'
                      : isCurrent
                      ? 'text-neutral-700 hover:bg-neutral-100'
                      : 'text-neutral-300 hover:text-neutral-500'
                  }`}
                >
                  {item.day}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 border-t border-neutral-100 text-xs">
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const dayStr = String(today.getDate()).padStart(2, '0');
              const monthStr = String(today.getMonth() + 1).padStart(2, '0');
              onSelectDate(`${dayStr}.${monthStr}.${today.getFullYear()}`);
              onClose();
            }}
            className="text-neutral-600 hover:text-neutral-900 font-medium"
          >
            Dzisiaj
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
