// DateRangePicker.tsx - Optimized for Table Integration
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { TimeSelection } from '../../../types/dateFilter';

interface DateRangePickerProps {
  onApply: (result: {
    startDate: Date | null;
    endDate: Date | null;
    selectedDates?: Date[];
    startTime: { hours: number; minutes: number };
    endTime: { hours: number; minutes: number };
    preset: string;
    isPickAnyDate: boolean;
  }) => void;
  onCancel: () => void;
  onClear: () => void;
  placeholders?: {
    startDate?: string;
    endDate?: string;
    fromDate?: string;
    toDate?: string;
  };
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
  onApply, 
  onCancel, 
  onClear,
  placeholders = {
    startDate: 'Start Date',
    endDate: 'End Date',
    fromDate: 'From',
    toDate: 'To'
  },
  initialStartDate = null,
  initialEndDate = null 
}) => {
  const [selectedRange, setSelectedRange] = useState({
    start: initialStartDate,
    end: initialEndDate
  });
  
  const [selectedDates, setSelectedDates] = useState(new Set<string>());
  
  const [startTime, setStartTime] = useState({ hours: 0, minutes: 0 });
  const [endTime, setEndTime] = useState({ hours: 23, minutes: 59 });
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activePreset, setActivePreset] = useState('customised');
  const [customNumbers, setCustomNumbers] = useState<{[key: string]: number}>({});
  const [isPickAnyDate, setIsPickAnyDate] = useState(false);
  const [isRangeSelectionMode, setIsRangeSelectionMode] = useState(false);

  const presets = [
    { id: 'customised', label: 'Customised', icon: '≫' },
    { id: 'last-x-minutes', label: 'Last', suffix: 'Minutes', hasInput: true },
    { id: 'last-x-hours', label: 'Last', suffix: 'Hours', hasInput: true },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last-x-days', label: 'Last', suffix: 'Days', hasInput: true },
    { id: 'this-week', label: 'This Week' },
    { id: 'last-x-weeks', label: 'Last', suffix: 'Weeks', hasInput: true },
    { id: 'this-month', label: 'This Month' },
    { id: 'last-x-months', label: 'Last', suffix: 'Months', hasInput: true },
    { id: 'this-year', label: 'This Year' },
    { id: 'last-x-years', label: 'Last', suffix: 'Years', hasInput: true },
    { id: 'pick-any-date', label: 'Pick Any Date' }
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Initialize current month based on selected dates or current date
  useEffect(() => {
    if (selectedRange.start) {
      setCurrentMonth(new Date(selectedRange.start.getFullYear(), selectedRange.start.getMonth(), 1));
    } else {
      setCurrentMonth(new Date());
    }
  }, [selectedRange.start]);

  // Validate and fix time consistency
  useEffect(() => {
    if (selectedRange.start && selectedRange.end && selectedRange.start.toDateString() === selectedRange.end.toDateString()) {
      // Same day selection - ensure end time is after start time
      if (startTime.hours > endTime.hours || (startTime.hours === endTime.hours && startTime.minutes >= endTime.minutes)) {
        setEndTime({ hours: 23, minutes: 59 });
      }
    }
  }, [startTime, endTime, selectedRange]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateInRange = (date: Date | null) => {
    if (!date || !selectedRange.start) return false;
    
    // For pick any date mode, no range highlighting
    if (isPickAnyDate) return false;
    
    // For range selection, need both start and end
    if (!selectedRange.end) return false;
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOnly = new Date(selectedRange.start.getFullYear(), selectedRange.start.getMonth(), selectedRange.start.getDate());
    const endOnly = new Date(selectedRange.end.getFullYear(), selectedRange.end.getMonth(), selectedRange.end.getDate());
    return dateOnly >= startOnly && dateOnly <= endOnly;
  };

  const isDateSelected = (date: Date | null) => {
    if (!date) return false;
    
    // For pick any date mode, check if date is in selected dates set
    if (isPickAnyDate) {
      return selectedDates.has(date.toDateString());
    }
    
    // For range selection, highlight start and end dates
    return (selectedRange.start && date.toDateString() === selectedRange.start.toDateString()) ||
           (selectedRange.end && date.toDateString() === selectedRange.end.toDateString());
  };

  const handleDateClick = (date: Date | null) => {
    if (!date) return;
    
    if (isPickAnyDate) {
      // For pick any date, allow multiple date selection
      const dateString = date.toDateString();
      const newSelectedDates = new Set(selectedDates);
      
      if (newSelectedDates.has(dateString)) {
        // If date is already selected, remove it
        newSelectedDates.delete(dateString);
      } else {
        // If date is not selected, add it
        newSelectedDates.add(dateString);
      }
      
      setSelectedDates(newSelectedDates);
      
      // Update selectedRange for display purposes
      if (newSelectedDates.size > 0) {
        const dates = Array.from(newSelectedDates).map(dateStr => new Date(dateStr)).sort();
        setSelectedRange({ 
          start: dates[0], 
          end: dates[dates.length - 1] 
        });
      } else {
        setSelectedRange({ start: null, end: null });
      }
      
      setStartTime({ hours: 0, minutes: 0 });
      setEndTime({ hours: 23, minutes: 59 });
    } else if (isRangeSelectionMode || activePreset === 'customised') {
      // For date range selection
      if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
        // Create a clean date without time
        const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        setSelectedRange({ start: cleanDate, end: null });
        setSelectedDates(new Set()); // Clear multiple date selection
        setStartTime({ hours: 0, minutes: 0 });
        setEndTime({ hours: 23, minutes: 59 });
      } else if (selectedRange.start && !selectedRange.end) {
        const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (cleanDate < selectedRange.start) {
          setSelectedRange({ start: cleanDate, end: selectedRange.start });
        } else {
          setSelectedRange({ start: selectedRange.start, end: cleanDate });
        }
        // Ensure end time is set properly
        setEndTime({ hours: 23, minutes: 59 });
      }
    }
  };

  const handlePresetClick = (presetId: string, customValue?: number) => {
    setActivePreset(presetId);
    const now = new Date();
    const value = customValue || customNumbers[presetId] || 1;
    
    // Ensure minimum value is 1 for calculations
    const safeValue = Math.max(1, Math.abs(Math.floor(value)));
    
    switch (presetId) {
      case 'customised':
        setIsPickAnyDate(false);
        setIsRangeSelectionMode(true);
        setSelectedDates(new Set()); // Clear multiple date selection
        // Don't auto-set dates, let user select manually
        break;
        
      case 'today':
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        setSelectedRange({ start: todayStart, end: todayEnd });
        setStartTime({ hours: 0, minutes: 0 });
        setEndTime({ hours: 23, minutes: 59 });
        setIsPickAnyDate(false);
        setIsRangeSelectionMode(false);
        setSelectedDates(new Set()); // Clear multiple date selection
        break;
        
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        setSelectedRange({ start: yesterdayStart, end: yesterdayEnd });
        setStartTime({ hours: 0, minutes: 0 });
        setEndTime({ hours: 23, minutes: 59 });
        setIsPickAnyDate(false);
        setIsRangeSelectionMode(false);
        setSelectedDates(new Set());
        break;
        
      case 'last-x-days':
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - safeValue);
        const daysAgoStart = new Date(daysAgo.getFullYear(), daysAgo.getMonth(), daysAgo.getDate());
        const daysAgoEnd = new Date();
        const daysAgoEndProper = new Date(daysAgoEnd.getFullYear(), daysAgoEnd.getMonth(), daysAgoEnd.getDate());
        setSelectedRange({ start: daysAgoStart, end: daysAgoEndProper });
        setStartTime({ hours: 0, minutes: 0 });
        setEndTime({ hours: 23, minutes: 59 });
        setIsPickAnyDate(false);
        setIsRangeSelectionMode(false);
        setSelectedDates(new Set());
        break;
        
      case 'last-x-weeks':
        const weeksAgo = new Date();
        weeksAgo.setDate(weeksAgo.getDate() - (safeValue * 7));
        const weeksAgoStart = new Date(weeksAgo.getFullYear(), weeksAgo.getMonth(), weeksAgo.getDate());
        const weeksAgoEnd = new Date();
        const weeksAgoEndProper = new Date(weeksAgoEnd.getFullYear(), weeksAgoEnd.getMonth(), weeksAgoEnd.getDate());
        setSelectedRange({ start: weeksAgoStart, end: weeksAgoEndProper });
        setStartTime({ hours: 0, minutes: 0 });
        setEndTime({ hours: 23, minutes: 59 });
        setIsPickAnyDate(false);
        setIsRangeSelectionMode(false);
        setSelectedDates(new Set());
        break;
        
      case 'last-x-months':
        const monthsAgo = new Date();
        monthsAgo.setMonth(monthsAgo.getMonth() - safeValue);
        const monthsAgoStart = new Date(monthsAgo.getFullYear(), monthsAgo.getMonth(), monthsAgo.getDate());
        const monthsAgoEnd = new Date();
        const monthsAgoEndProper = new Date(monthsAgoEnd.getFullYear(), monthsAgoEnd.getMonth(), monthsAgoEnd.getDate());
        setSelectedRange({ start: monthsAgoStart, end: monthsAgoEndProper });
        setStartTime({ hours: 0, minutes: 0 });
        setEndTime({ hours: 23, minutes: 59 });
        setIsPickAnyDate(false);
        setIsRangeSelectionMode(false);
        setSelectedDates(new Set());
        break;
        
      case 'last-x-years':
        const yearsAgo = new Date();
        yearsAgo.setFullYear(yearsAgo.getFullYear() - safeValue);
        const yearsAgoStart = new Date(yearsAgo.getFullYear(), yearsAgo.getMonth(), yearsAgo.getDate());
        const yearsAgoEnd = new Date();
        const yearsAgoEndProper = new Date(yearsAgoEnd.getFullYear(), yearsAgoEnd.getMonth(), yearsAgoEnd.getDate());
        setSelectedRange({ start: yearsAgoStart, end: yearsAgoEndProper });
        setStartTime({ hours: 0, minutes: 0 });
        setEndTime({ hours: 23, minutes: 59 });
        setIsPickAnyDate(false);
        setIsRangeSelectionMode(false);
        setSelectedDates(new Set());
        break;
        
      case 'this-week':
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const startOfWeekProper = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
        const endOfWeek = new Date();
        const endOfWeekProper = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate());
        setSelectedRange({ start: startOfWeekProper, end: endOfWeekProper });
        setStartTime({ hours: 0, minutes: 0 });
        setEndTime({ hours: 23, minutes: 59 });
        setIsPickAnyDate(false);
        setIsRangeSelectionMode(false);
        setSelectedDates(new Set());
        break;
        
      case 'this-month':
        const startOfMonth = new Date();
        const startOfMonthProper = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 1);
        const endOfMonth = new Date();
        const endOfMonthProper = new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate());
        setSelectedRange({ start: startOfMonthProper, end: endOfMonthProper });
        setStartTime({ hours: 0, minutes: 0 });
        setEndTime({ hours: 23, minutes: 59 });
        setIsPickAnyDate(false);
        setIsRangeSelectionMode(false);
        setSelectedDates(new Set());
        break;
        
      case 'this-year':
        const startOfYear = new Date();
        const startOfYearProper = new Date(startOfYear.getFullYear(), 0, 1);
        const endOfYear = new Date();
        const endOfYearProper = new Date(endOfYear.getFullYear(), endOfYear.getMonth(), endOfYear.getDate());
        setSelectedRange({ start: startOfYearProper, end: endOfYearProper });
        setStartTime({ hours: 0, minutes: 0 });
        setEndTime({ hours: 23, minutes: 59 });
        setIsPickAnyDate(false);
        setIsRangeSelectionMode(false);
        setSelectedDates(new Set());
        break;
        
      case 'last-x-minutes':
        const minutesAgo = new Date();
        const currentMinutes = minutesAgo.getMinutes();
        const currentSeconds = minutesAgo.getSeconds();
        minutesAgo.setMinutes(currentMinutes - safeValue, currentSeconds, minutesAgo.getMilliseconds());
        const endMinutes = new Date();
        setSelectedRange({ start: minutesAgo, end: endMinutes });
        setStartTime({ hours: minutesAgo.getHours(), minutes: minutesAgo.getMinutes() });
        setEndTime({ hours: endMinutes.getHours(), minutes: endMinutes.getMinutes() });
        setIsPickAnyDate(false);
        setIsRangeSelectionMode(false);
        setSelectedDates(new Set());
        break;
        
      case 'last-x-hours':
        const hoursAgo = new Date();
        hoursAgo.setHours(hoursAgo.getHours() - safeValue);
        const endHours = new Date();
        setSelectedRange({ start: hoursAgo, end: endHours });
        setStartTime({ hours: hoursAgo.getHours(), minutes: hoursAgo.getMinutes() });
        setEndTime({ hours: endHours.getHours(), minutes: endHours.getMinutes() });
        setIsPickAnyDate(false);
        setIsRangeSelectionMode(false);
        setSelectedDates(new Set());
        break;
        
      case 'pick-any-date':
        setIsPickAnyDate(true);
        setIsRangeSelectionMode(false);
        setSelectedRange({ start: null, end: null });
        setSelectedDates(new Set()); // Reset multiple date selection
        setStartTime({ hours: 0, minutes: 0 });
        setEndTime({ hours: 23, minutes: 59 });
        break;
        
      default:
        break;
    }
  };

  const handleCustomNumberChange = (presetId: string, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1) {
      // Clear invalid values
      const newNumbers = { ...customNumbers };
      delete newNumbers[presetId];
      setCustomNumbers(newNumbers);
      return;
    }
    
    if (numValue > 1000) {
      // Prevent extremely large values
      return;
    }
    
    setCustomNumbers({ ...customNumbers, [presetId]: numValue });
    if (activePreset === presetId) {
      handlePresetClick(presetId, numValue);
    }
  };

  const adjustTime = (timeType: 'start' | 'end', field: 'hours' | 'minutes', direction: 'up' | 'down') => {
    const adjustment = direction === 'up' ? 1 : -1;
    
    if (timeType === 'start') {
      setStartTime(prev => {
        const newTime = { ...prev };
        if (field === 'hours') {
          newTime.hours = Math.max(0, Math.min(23, prev.hours + adjustment));
        } else {
          newTime.minutes = Math.max(0, Math.min(59, prev.minutes + adjustment));
        }
        return newTime;
      });
    } else {
      setEndTime(prev => {
        const newTime = { ...prev };
        if (field === 'hours') {
          newTime.hours = Math.max(0, Math.min(23, prev.hours + adjustment));
        } else {
          newTime.minutes = Math.max(0, Math.min(59, prev.minutes + adjustment));
        }
        return newTime;
      });
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleClear = () => {
    setSelectedRange({ start: null, end: null });
    setSelectedDates(new Set()); // Clear multiple date selection
    setStartTime({ hours: 0, minutes: 0 });
    setEndTime({ hours: 23, minutes: 59 });
    setActivePreset('customised');
    setIsPickAnyDate(false);
    setIsRangeSelectionMode(true);
    setCustomNumbers({});
    onClear();
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleApply = () => {
    // Validation for pick any date mode
    if (isPickAnyDate) {
      if (selectedDates.size === 0) {
        alert('Please select at least one date');
        return;
      }
      
      // Convert selected dates to array and sort
      const datesArray = Array.from(selectedDates).map(dateStr => new Date(dateStr)).sort();
      
      const result = {
        startDate: datesArray[0],
        endDate: datesArray[datesArray.length - 1],
        selectedDates: datesArray, // Include all selected dates
        startTime,
        endTime,
        preset: activePreset,
        isPickAnyDate: true,
        customValue: customNumbers[activePreset] // Pass the custom value if it exists
      };
      
      onApply(result);
      return;
    }
    
    // Validation for range selection
    if (!selectedRange.start) {
      alert('Please select a start date');
      return;
    }
    
    let finalEndDate = selectedRange.end || selectedRange.start;
    
    // Validation for range selection
    if (selectedRange.start && finalEndDate && selectedRange.start > finalEndDate) {
      alert('End date cannot be before start date');
      return;
    }

    // Fix timezone and time issues
    const createDateWithTime = (date: Date, time: TimeSelection, isEndOfDay: boolean = false) => {
      // Create new date preserving the selected date in local timezone
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      
      let hours, minutes, seconds, milliseconds;
      
      if (isEndOfDay && selectedRange.start && finalEndDate && 
          selectedRange.start.toDateString() === finalEndDate.toDateString()) {
        // Same day selection - use end time
        hours = time.hours;
        minutes = time.minutes;
        seconds = 59;
        milliseconds = 999;
      } else if (isEndOfDay) {
        // Different day selection - end of day
        hours = 23;
        minutes = 59;
        seconds = 59;
        milliseconds = 999;
      } else {
        // Start of day or specific time
        hours = time.hours;
        minutes = time.minutes;
        seconds = 0;
        milliseconds = 0;
      }
      
      // Create date in local timezone, then convert to UTC properly
      const localDate = new Date(year, month, day, hours, minutes, seconds, milliseconds);
      return localDate;
    };
    
    const startDateWithTime = createDateWithTime(selectedRange.start, startTime, false);
    const endDateWithTime = createDateWithTime(finalEndDate, endTime, true);
    
    const result = {
      startDate: startDateWithTime,
      endDate: endDateWithTime,
      startTime,
      endTime,
      preset: activePreset,
      isPickAnyDate: false,
      customValue: customNumbers[activePreset] // Pass the custom value if it exists
    };
    
    onApply(result);
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const renderCalendar = (monthOffset: number = 0) => {
    const calendarDate = new Date(currentMonth);
    calendarDate.setMonth(calendarDate.getMonth() + monthOffset);
    const days = getDaysInMonth(calendarDate);

    return (
      <div className="w-72">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {monthOffset === 0 && (
              <button 
                onClick={() => navigateMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <select 
              value={monthNames[calendarDate.getMonth()]}
              onChange={(e) => {
                const newMonth = new Date(calendarDate);
                newMonth.setMonth(monthNames.indexOf(e.target.value));
                setCurrentMonth(newMonth);
              }}
              className="text-sm border rounded px-2 py-1"
            >
              {monthNames.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <select 
              value={calendarDate.getFullYear()}
              onChange={(e) => {
                const newMonth = new Date(calendarDate);
                newMonth.setFullYear(parseInt(e.target.value));
                setCurrentMonth(newMonth);
              }}
              className="text-sm border rounded px-2 py-1"
            >
              {Array.from({length: 20}, (_, i) => new Date().getFullYear() - 10 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {monthOffset === 1 && (
              <button 
                onClick={() => navigateMonth(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const isToday = date && date.toDateString() === new Date().toDateString();
            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={!date}
                className={`
                  h-8 text-xs rounded transition-colors relative
                  ${!date ? 'invisible' : ''}
                  ${isDateSelected(date) 
                    ? 'bg-blue-500 text-white' 
                    : isDateInRange(date)
                    ? 'bg-blue-100 text-blue-900'
                    : isToday
                    ? 'bg-gray-200 font-semibold'
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                {date?.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const TimeSelector: React.FC<{ time: { hours: number; minutes: number }; timeType: 'start' | 'end'; isHours: boolean }> = ({ time, timeType, isHours }) => (
    <div className="flex flex-col items-center border rounded bg-white">
      <button 
        onClick={() => adjustTime(timeType, isHours ? 'hours' : 'minutes', 'up')}
        className="p-1 hover:bg-gray-100 w-full border-b flex justify-center"
      >
        <ChevronUp size={14} />
      </button>
      <div className="text-lg font-mono px-3 py-2 min-w-[50px] text-center bg-gray-50">
        {String(isHours ? time.hours : time.minutes).padStart(2, '0')}
      </div>
      <button 
        onClick={() => adjustTime(timeType, isHours ? 'hours' : 'minutes', 'down')}
        className="p-1 hover:bg-gray-100 w-full border-t flex justify-center"
      >
        <ChevronDown size={14} />
      </button>
      <div className="text-xs text-gray-400 py-1 bg-white">01</div>
    </div>
  );

  return (
    <div className="bg-white border rounded-lg shadow-lg p-4 max-w-5xl mx-auto">
      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-44 border-r pr-4">
          <div className="space-y-1">
            {presets.map(preset => (
              <div key={preset.id} className="flex items-center">
                <button
                  onClick={() => handlePresetClick(preset.id)}
                  className={`
                    flex-1 text-left px-2 py-1 text-xs rounded transition-colors flex items-center justify-between
                    ${activePreset === preset.id 
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="flex-1">
                    {preset.label}
                    {preset.suffix && ` ${preset.suffix}`}
                  </span>
                  {preset.icon && <span className="text-blue-500 ml-2">{preset.icon}</span>}
                </button>
                {preset.hasInput && (
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="X"
                    value={customNumbers[preset.id] || ''}
                    onChange={(e) => handleCustomNumberChange(preset.id, e.target.value)}
                    className="w-12 text-xs border rounded px-1 py-1 ml-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex gap-6">
            {/* From Section */}
            <div className="flex-1">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  {isPickAnyDate 
                    ? selectedDates.size > 0 
                      ? `${selectedDates.size} date${selectedDates.size > 1 ? 's' : ''} selected`
                      : placeholders.startDate
                    : `${selectedRange.start ? formatDate(selectedRange.start) : placeholders.startDate} - ${selectedRange.end ? formatDate(selectedRange.end) : placeholders.endDate}`
                  }
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{placeholders.fromDate}</label>
              </div>
              {renderCalendar(0)}
              
              {/* From Time */}
              <div className="mt-4 flex justify-center items-center space-x-2">
                <TimeSelector time={startTime} timeType="start" isHours={true} />
                <div className="flex items-center text-lg font-mono px-2">:</div>
                <TimeSelector time={startTime} timeType="start" isHours={false} />
              </div>
            </div>

            {/* To Section */}
            <div className="flex-1">
              <div className="mb-4">
                <div className="flex justify-end space-x-2 mb-2">
                  <button 
                    onClick={handleClear}
                    className="text-blue-500 text-sm hover:underline"
                  >
                    Clear filters
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleApply}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{placeholders.toDate}</label>
              </div>
              {renderCalendar(1)}
              
              {/* To Time */}
              <div className="mt-4 flex justify-center items-center space-x-2">
                <TimeSelector time={endTime} timeType="end" isHours={true} />
                <div className="flex items-center text-lg font-mono px-2">:</div>
                <TimeSelector time={endTime} timeType="end" isHours={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;