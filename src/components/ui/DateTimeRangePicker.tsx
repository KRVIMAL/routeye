// src/components/ui/DateTimeRangePicker.tsx - Custom DateTime Range Picker
import React, { useState, useRef, useEffect, useCallback } from "react";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import Button from "./Button";

// Initialize dayjs plugins
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export interface DateTimeRange {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

interface DateTimeRangePickerProps {
  value?: DateTimeRange;
  onChange?: (range: DateTimeRange) => void;
  placeholder?: string;
  format?: string;
  disabled?: boolean;
  disablePastDates?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  className?: string;
  label?: string;
  error?: string;
  required?: boolean;
  showTime?: boolean;
  use24HourFormat?: boolean;
}

const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({
  value,
  onChange,
  placeholder = "MM/DD/YYYY hh:mm aa – MM/DD/YYYY hh:mm aa",
  format = "MM/DD/YYYY hh:mm A",
  disabled = false,
  disablePastDates = false,
  minDate,
  maxDate,
  className = "",
  label,
  error,
  required = false,
  showTime = true,
  use24HourFormat = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<"start" | "end">("start");
  const [inputValue, setInputValue] = useState("");
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [tempRange, setTempRange] = useState<DateTimeRange>({
    startDate: null,
    endDate: null,
  });

  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize temp range from value
  useEffect(() => {
    if (value) {
      setTempRange(value);
      updateInputValue(value);
    }
  }, [value]);

  // Update input display value with slider indication
  const updateInputValue = (range: DateTimeRange) => {
    if (range.startDate && range.endDate) {
      const startStr = range.startDate.format(format);
      const endStr = range.endDate.format(format);
      setInputValue(`${startStr} – ${endStr}`);
    } else if (range.startDate) {
      const startStr = range.startDate.format(format);
      setInputValue(`${startStr} – `);
    } else {
      setInputValue("");
    }
  };

  // Handle input field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);

    // Try to parse the input
    const parts = inputVal.split(" – ");
    if (parts.length === 2) {
      const startDate = dayjs(parts[0], format, true);
      const endDate = dayjs(parts[1], format, true);

      if (startDate.isValid() && endDate.isValid()) {
        const newRange = { startDate, endDate };
        setTempRange(newRange);
        if (onChange) {
          onChange(newRange);
        }
      }
    }
  };

  // Handle opening the picker - always start from beginning
  const handleOpenPicker = () => {
    if (disabled) return;
    setCurrentStep("start"); // Always reset to start step when opening
    setIsOpen(true);
  };

  // Handle calendar date selection
  const handleDateSelect = (date: Dayjs) => {
    if (currentStep === "start") {
      const newRange = {
        startDate: showTime ? date.hour(12).minute(0) : date.startOf("day"),
        endDate: tempRange.endDate,
      };

      // If end date exists and new start date is after end date, clear end date
      if (newRange.endDate && newRange.startDate.isAfter(newRange.endDate)) {
        newRange.endDate = null;
      }

      setTempRange(newRange);
      updateInputValue(newRange);

      // DON'T auto advance - wait for Next button click
    } else {
      // Ensure end date is not before start date
      if (tempRange.startDate && date.isBefore(tempRange.startDate, "day")) {
        return;
      }

      const newRange = {
        startDate: tempRange.startDate,
        endDate: showTime ? date.hour(12).minute(0) : date.endOf("day"),
      };
      setTempRange(newRange);
      updateInputValue(newRange);
    }
  };

  // Generate placeholder from format
  const getPlaceholderFromFormat = (fmt: string) => {
    return fmt
      .replace(/MM/g, "MM")
      .replace(/DD/g, "DD")
      .replace(/YYYY/g, "YYYY")
      .replace(/hh/g, "hh")
      .replace(/mm/g, "mm")
      .replace(/A/g, "aa")
      .replace(/HH/g, "HH");
  };

  // Get current time for the active step
  const getCurrentTime = () => {
    const activeDate =
      currentStep === "start" ? tempRange.startDate : tempRange.endDate;
    if (!activeDate) {
      return {
        hour: use24HourFormat ? 12 : 12,
        minute: 0,
        meridiem: "AM",
      };
    }

    return {
      hour: use24HourFormat ? activeDate.hour() : activeDate.hour() % 12 || 12,
      minute: activeDate.minute(),
      meridiem: activeDate.hour() >= 12 ? "PM" : "AM",
    };
  };

  // Handle time changes
  const handleTimeChange = (
    type: "start" | "end",
    field: "hour" | "minute" | "meridiem",
    value: number | string
  ) => {
    const dateToUpdate =
      type === "start" ? tempRange.startDate : tempRange.endDate;
    if (!dateToUpdate) return;

    let updatedDate = dateToUpdate;

    if (field === "hour") {
      if (use24HourFormat) {
        updatedDate = dateToUpdate.hour(value as number);
      } else {
        const currentMeridiem = dateToUpdate.hour() >= 12 ? "PM" : "AM";
        let hour24 = value as number;
        if (currentMeridiem === "PM" && hour24 !== 12) {
          hour24 += 12;
        } else if (currentMeridiem === "AM" && hour24 === 12) {
          hour24 = 0;
        }
        updatedDate = dateToUpdate.hour(hour24);
      }
    } else if (field === "minute") {
      updatedDate = dateToUpdate.minute(value as number);
    } else if (field === "meridiem") {
      const currentHour = dateToUpdate.hour() % 12;
      const hour24 =
        value === "PM"
          ? currentHour === 0
            ? 12
            : currentHour + 12
          : currentHour;
      updatedDate = dateToUpdate.hour(hour24);
    }

    const newRange = {
      ...tempRange,
      [type === "start" ? "startDate" : "endDate"]: updatedDate,
    };

    setTempRange(newRange);
    updateInputValue(newRange);
  };

  // Handle OK/Apply button
  const handleApply = () => {
    if (onChange && tempRange.startDate && tempRange.endDate) {
      onChange(tempRange);
    }
    setCurrentStep("start"); // Reset for next time
    setIsOpen(false);
  };

  // Handle Cancel button
  const handleCancel = () => {
    setTempRange(value || { startDate: null, endDate: null });
    if (value) {
      updateInputValue(value);
    } else {
      setInputValue("");
    }
    setCurrentStep("start"); // Always reset to start step
    setIsOpen(false);
  };

  // Handle Next button
  const handleNext = () => {
    if (currentStep === "start" && tempRange.startDate) {
      // Don't copy start date to end date, just move to next step
      setCurrentStep("end");
    }
  };

  // Check if date should be disabled
  const isDateDisabled = (date: Dayjs) => {
    const now = dayjs();

    if (disablePastDates && date.isBefore(now, "day")) {
      return true;
    }

    if (minDate && date.isBefore(minDate, "day")) {
      return true;
    }

    if (maxDate && date.isAfter(maxDate, "day")) {
      return true;
    }

    // For end date selection, disable dates before start date
    if (
      currentStep === "end" &&
      tempRange.startDate &&
      date.isBefore(tempRange.startDate, "day")
    ) {
      return true;
    }

    return false;
  };

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");
    const startDate = startOfMonth.startOf("week");
    const endDate = endOfMonth.endOf("week");

    const days = [];
    let current = startDate;

    while (current.isSameOrBefore(endDate)) {
      days.push(current);
      current = current.add(1, "day");
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-body-small font-medium text-text-primary mb-1">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-12 bg-theme-primary border rounded-md
            text-text-primary placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500
            transition-colors duration-200
            ${error ? "border-error-500" : "border-border-medium"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          onClick={handleOpenPicker}
          readOnly={false}
        />

        <button
          type="button"
          onClick={handleOpenPicker}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary"
        >
          <FiCalendar className="w-5 h-5" />
        </button>
      </div>

      {error && <p className="mt-1 text-caption text-error-600">{error}</p>}

      {/* Picker Dropdown */}
      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute top-full left-0 mt-2 z-modal bg-theme-primary border border-border-light rounded-lg shadow-lg min-w-[480px]"
        >
          {/* Header with step indicator */}
          <div className="p-4 border-b border-border-light">
            {/* Input field with slider */}
            <div className="relative mb-4">
              <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-md border border-border-light">
                <div className="flex-1 flex items-center">
                  <div
                    className={`
                    px-3 py-1 rounded text-body-small transition-all duration-200
                    ${
                      currentStep === "start"
                        ? "bg-primary-500 text-white"
                        : "bg-transparent text-text-secondary"
                    }
                  `}
                  >
                    {tempRange.startDate
                      ? tempRange.startDate.format(format)
                      : getPlaceholderFromFormat(format)}
                  </div>
                  <span className="mx-2 text-text-muted">–</span>
                  <div
                    className={`
                    px-3 py-1 rounded text-body-small transition-all duration-200
                    ${
                      currentStep === "end"
                        ? "bg-primary-500 text-white"
                        : "bg-transparent text-text-secondary"
                    }
                  `}
                  >
                    {tempRange.endDate
                      ? tempRange.endDate.format(format)
                      : getPlaceholderFromFormat(format)}
                  </div>
                </div>
              </div>
            </div>

            {/* Current selection display */}
            <div className="text-body-small text-text-secondary">
              {currentStep === "start"
                ? "Select start date & time"
                : "Select end date & time"}
            </div>
          </div>

          <div className="flex">
            {/* Calendar Section */}
            <div className="flex-1 p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() =>
                    setCurrentMonth(currentMonth.subtract(1, "month"))
                  }
                  className="p-2 rounded-md hover:bg-theme-tertiary transition-colors"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-body font-medium text-text-primary">
                  {currentMonth.format("MMMM YYYY")}
                </h3>
                <button
                  onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
                  className="p-2 rounded-md hover:bg-theme-tertiary transition-colors"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-6">
                {/* Week days header */}
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-caption font-medium text-text-muted"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day) => {
                  const isCurrentMonth = day.month() === currentMonth.month();
                  const isSelected =
                    (tempRange.startDate &&
                      day.isSame(tempRange.startDate, "day")) ||
                    (tempRange.endDate && day.isSame(tempRange.endDate, "day"));
                  const isInRange =
                    tempRange.startDate &&
                    tempRange.endDate &&
                    day.isAfter(tempRange.startDate, "day") &&
                    day.isBefore(tempRange.endDate, "day");
                  const isDisabled = isDateDisabled(day);
                  const isToday = day.isSame(dayjs(), "day");

                  return (
                    <button
                      key={day.format("YYYY-MM-DD")}
                      onClick={() => !isDisabled && handleDateSelect(day)}
                      disabled={isDisabled}
                      className={`
                        p-2 text-caption rounded-md transition-colors relative
                        ${!isCurrentMonth ? "text-text-muted opacity-50" : ""}
                        ${isSelected ? "bg-primary-500 text-white" : ""}
                        ${isInRange ? "bg-primary-100 text-primary-900" : ""}
                        ${
                          isToday && !isSelected
                            ? "border border-primary-500"
                            : ""
                        }
                        ${
                          isDisabled
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-theme-tertiary"
                        }
                        ${
                          !isSelected && !isInRange && !isDisabled
                            ? "text-text-primary"
                            : ""
                        }
                      `}
                    >
                      {day.date()}
                    </button>
                  );
                })}
              </div>

              {/* Time Selector - Simple dropdowns to match the design in the image */}
              {showTime && (
                <div className="border-t border-border-light pt-4">
                  <div className="flex items-center justify-center space-x-4">
                    {/* Hour */}
                    <div className="flex items-center space-x-2">
                      <span className="text-body-small text-text-secondary w-12">
                        Hour:
                      </span>
                      <select
                        value={getCurrentTime().hour}
                        onChange={(e) =>
                          handleTimeChange(
                            currentStep,
                            "hour",
                            parseInt(e.target.value)
                          )
                        }
                        className="px-2 py-1 border border-border-light rounded text-body-small bg-theme-primary"
                      >
                        {Array.from(
                          { length: use24HourFormat ? 24 : 12 },
                          (_, i) => {
                            const displayHour = use24HourFormat
                              ? i
                              : i === 0
                              ? 12
                              : i;
                            const valueHour = use24HourFormat
                              ? i
                              : i === 0
                              ? 12
                              : i;
                            return (
                              <option key={i} value={valueHour}>
                                {displayHour.toString().padStart(2, "0")}
                              </option>
                            );
                          }
                        )}
                      </select>
                    </div>

                    {/* Minute */}
                    <div className="flex items-center space-x-2">
                      <span className="text-body-small text-text-secondary w-16">
                        Minute:
                      </span>
                      <select
                        value={getCurrentTime().minute}
                        onChange={(e) =>
                          handleTimeChange(
                            currentStep,
                            "minute",
                            parseInt(e.target.value)
                          )
                        }
                        className="px-2 py-1 border border-border-light rounded text-body-small bg-theme-primary"
                      >
                        {Array.from({ length: 12 }, (_, i) => i * 5).map(
                          (minute) => (
                            <option key={minute} value={minute}>
                              {minute.toString().padStart(2, "0")}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* AM/PM */}
                    {!use24HourFormat && (
                      <div className="flex items-center space-x-2">
                        <select
                          value={getCurrentTime().meridiem}
                          onChange={(e) =>
                            handleTimeChange(
                              currentStep,
                              "meridiem",
                              e.target.value
                            )
                          }
                          className="px-2 py-1 border border-border-light rounded text-body-small bg-theme-primary"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with action buttons */}
          <div className="flex items-center justify-between p-4 border-t border-border-light">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>

            <div className="flex space-x-2">
              {currentStep === "start" ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!tempRange.startDate}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleApply}
                  disabled={!tempRange.startDate || !tempRange.endDate}
                >
                  OK
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Time Picker Section Component
interface TimePickerSectionProps {
  value: Dayjs;
  onChange: (
    field: "hour" | "minute" | "meridiem",
    value: number | string
  ) => void;
  use24HourFormat?: boolean;
}

const TimePickerSection: React.FC<TimePickerSectionProps> = ({
  value,
  onChange,
  use24HourFormat = false,
}) => {
  const hour = use24HourFormat ? value.hour() : value.hour() % 12 || 12;
  const minute = value.minute();
  const meridiem = value.hour() >= 12 ? "PM" : "AM";

  const handleIncrement = (field: "hour" | "minute") => {
    if (field === "hour") {
      const newHour = use24HourFormat
        ? (value.hour() + 1) % 24
        : value.hour() + 1;
      onChange("hour", newHour);
    } else {
      const newMinute = (value.minute() + 5) % 60;
      onChange("minute", newMinute);
    }
  };

  const handleDecrement = (field: "hour" | "minute") => {
    if (field === "hour") {
      const newHour = use24HourFormat
        ? (value.hour() - 1 + 24) % 24
        : value.hour() - 1;
      onChange("hour", newHour);
    } else {
      const newMinute = (value.minute() - 5 + 60) % 60;
      onChange("minute", newMinute);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hour */}
      <div className="text-center">
        <button
          onClick={() => handleIncrement("hour")}
          className="w-full p-2 rounded-md hover:bg-theme-tertiary transition-colors"
        >
          <FiChevronUp className="w-4 h-4 mx-auto" />
        </button>
        <div className="py-2 text-heading-3 font-mono text-text-primary">
          {hour.toString().padStart(2, "0")}
        </div>
        <button
          onClick={() => handleDecrement("hour")}
          className="w-full p-2 rounded-md hover:bg-theme-tertiary transition-colors"
        >
          <FiChevronDown className="w-4 h-4 mx-auto" />
        </button>
      </div>

      <div className="text-center text-heading-3 text-text-muted">:</div>

      {/* Minute */}
      <div className="text-center">
        <button
          onClick={() => handleIncrement("minute")}
          className="w-full p-2 rounded-md hover:bg-theme-tertiary transition-colors"
        >
          <FiChevronUp className="w-4 h-4 mx-auto" />
        </button>
        <div className="py-2 text-heading-3 font-mono text-text-primary">
          {minute.toString().padStart(2, "0")}
        </div>
        <button
          onClick={() => handleDecrement("minute")}
          className="w-full p-2 rounded-md hover:bg-theme-tertiary transition-colors"
        >
          <FiChevronDown className="w-4 h-4 mx-auto" />
        </button>
      </div>

      {/* AM/PM */}
      {!use24HourFormat && (
        <div className="text-center">
          <button
            onClick={() =>
              onChange("meridiem", meridiem === "AM" ? "PM" : "AM")
            }
            className="w-full p-2 rounded-md hover:bg-theme-tertiary transition-colors"
          >
            <FiChevronUp className="w-4 h-4 mx-auto" />
          </button>
          <div className="py-2 text-body font-medium text-text-primary">
            {meridiem}
          </div>
          <button
            onClick={() =>
              onChange("meridiem", meridiem === "AM" ? "PM" : "AM")
            }
            className="w-full p-2 rounded-md hover:bg-theme-tertiary transition-colors"
          >
            <FiChevronDown className="w-4 h-4 mx-auto" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DateTimeRangePicker;

/*
FIXED BEHAVIOR:

The component now correctly resets to start date selection every time it opens:

1. 🔄 OPENING: Always highlights start date with "Next" button (regardless of existing values)
2. ➡️ NEXT CLICK: Moves to end date selection, shows "OK" button  
3. ✅ OK CLICK: Applies range and closes, resets to start for next time
4. ❌ CANCEL/OUTSIDE CLICK: Reverts changes and resets to start for next time

This ensures users can always modify the start date when reopening the component.

WHY WE'RE NOT USING TimePickerSection:

The original TimePickerSection had increment/decrement buttons with arrows,
but based on your image, you wanted simple dropdown selectors for Hour/Minute/AM-PM.

The current implementation matches your design exactly:
- Simple dropdown selectors
- Inline with the calendar
- No complex increment/decrement UI

If you prefer the TimePickerSection with arrows, we can easily switch back by:
1. Uncommenting the TimePickerSection component below
2. Replacing the dropdown time selector with: 
   <TimePickerSection 
     value={currentStep === 'start' ? tempRange.startDate! : tempRange.endDate!}
     onChange={(field, value) => handleTimeChange(currentStep, field, value)}
     use24HourFormat={use24HourFormat}
   />

Note: FiChevronUp and FiChevronDown are already imported for the TimePickerSection if you need them.

Here's the TimePickerSection component if you want to use it:

// Time Picker Section Component with increment/decrement arrows
interface TimePickerSectionProps {
  value: Dayjs;
  onChange: (field: 'hour' | 'minute' | 'meridiem', value: number | string) => void;
  use24HourFormat?: boolean;
}

const TimePickerSection: React.FC<TimePickerSectionProps> = ({
  value,
  onChange,
  use24HourFormat = false
}) => {
  const hour = use24HourFormat ? value.hour() : value.hour() % 12 || 12;
  const minute = value.minute();
  const meridiem = value.hour() >= 12 ? 'PM' : 'AM';

  const handleIncrement = (field: 'hour' | 'minute') => {
    if (field === 'hour') {
      const newHour = use24HourFormat 
        ? (value.hour() + 1) % 24
        : value.hour() + 1;
      onChange('hour', newHour);
    } else {
      const newMinute = (value.minute() + 5) % 60;
      onChange('minute', newMinute);
    }
  };

  const handleDecrement = (field: 'hour' | 'minute') => {
    if (field === 'hour') {
      const newHour = use24HourFormat 
        ? (value.hour() - 1 + 24) % 24
        : value.hour() - 1;
      onChange('hour', newHour);
    } else {
      const newMinute = (value.minute() - 5 + 60) % 60;
      onChange('minute', newMinute);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hour *
      <div className="text-center">
        <button
          onClick={() => handleIncrement('hour')}
          className="w-full p-2 rounded-md hover:bg-theme-tertiary transition-colors"
        >
          <FiChevronUp className="w-4 h-4 mx-auto" />
        </button>
        <div className="py-2 text-heading-3 font-mono text-text-primary">
          {hour.toString().padStart(2, '0')}
        </div>
        <button
          onClick={() => handleDecrement('hour')}
          className="w-full p-2 rounded-md hover:bg-theme-tertiary transition-colors"
        >
          <FiChevronDown className="w-4 h-4 mx-auto" />
        </button>
      </div>

      <div className="text-center text-heading-3 text-text-muted">:</div>

      {/* Minute *
      <div className="text-center">
        <button
          onClick={() => handleIncrement('minute')}
          className="w-full p-2 rounded-md hover:bg-theme-tertiary transition-colors"
        >
          <FiChevronUp className="w-4 h-4 mx-auto" />
        </button>
        <div className="py-2 text-heading-3 font-mono text-text-primary">
          {minute.toString().padStart(2, '0')}
        </div>
        <button
          onClick={() => handleDecrement('minute')}
          className="w-full p-2 rounded-md hover:bg-theme-tertiary transition-colors"
        >
          <FiChevronDown className="w-4 h-4 mx-auto" />
        </button>
      </div>

      {/* AM/PM *
      {!use24HourFormat && (
        <div className="text-center">
          <button
            onClick={() => onChange('meridiem', meridiem === 'AM' ? 'PM' : 'AM')}
            className="w-full p-2 rounded-md hover:bg-theme-tertiary transition-colors"
          >
            <FiChevronUp className="w-4 h-4 mx-auto" />
          </button>
          <div className="py-2 text-body font-medium text-text-primary">
            {meridiem}
          </div>
          <button
            onClick={() => onChange('meridiem', meridiem === 'AM' ? 'PM' : 'AM')}
            className="w-full p-2 rounded-md hover:bg-theme-tertiary transition-colors"
          >
            <FiChevronDown className="w-4 h-4 mx-auto" />
          </button>
        </div>
      )}
    </div>
  );
};
*/
