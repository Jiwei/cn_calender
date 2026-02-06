import { WEEKDAYS } from '../core/constants.js';

/**
 * Calendar grid rendering (Web-specific DOM manipulation)
 */
class CalendarGrid {
  constructor(containerId, weekdayHeaderId) {
    this.container = document.getElementById(containerId);
    this.weekdayHeader = document.getElementById(weekdayHeaderId);
  }

  /**
   * Render the calendar grid for a lunar month
   */
  renderLunar(days, todayLunar, currentYear, currentMonth, isLeapMonth) {
    this.weekdayHeader.innerHTML = '';
    this.weekdayHeader.style.display = 'none';
    this.container.innerHTML = '';

    days.forEach(day => {
      const cell = this.createLunarDayCell(day, todayLunar, currentYear, currentMonth, isLeapMonth);
      this.container.appendChild(cell);
    });
  }

  /**
   * Render the calendar grid for a Gregorian month
   */
  renderGregorian(days, todayGregorian, currentYear, currentMonth) {
    // Render weekday header
    this.renderWeekdayHeader();

    this.container.innerHTML = '';

    days.forEach(day => {
      const cell = this.createGregorianDayCell(day, todayGregorian, currentYear, currentMonth);
      this.container.appendChild(cell);
    });
  }

  /**
   * Render weekday header for Gregorian view
   */
  renderWeekdayHeader() {
    this.weekdayHeader.innerHTML = '';
    this.weekdayHeader.style.display = 'grid';

    WEEKDAYS.forEach(weekday => {
      const cell = document.createElement('div');
      cell.className = 'weekday-cell';
      cell.textContent = weekday;
      this.weekdayHeader.appendChild(cell);
    });
  }

  /**
   * Create a day cell element for lunar view
   */
  createLunarDayCell(day, todayLunar, currentYear, currentMonth, isLeapMonth) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    // Check if this is today
    const isToday = this.isTodayLunar(day, todayLunar, currentYear, currentMonth, isLeapMonth);
    if (isToday) {
      cell.classList.add('today');
    }

    // Check for holiday
    if (day.holiday) {
      cell.classList.add('holiday');
    }

    // Check for solar term
    if (day.jieQi) {
      cell.classList.add('jieqi');
    }

    // Lunar day name
    const lunarDayEl = document.createElement('div');
    lunarDayEl.className = 'lunar-day';
    lunarDayEl.textContent = day.lunarDayName;
    cell.appendChild(lunarDayEl);

    // Holiday or solar term display (priority: holiday > jieqi)
    if (day.holiday || day.jieQi) {
      const specialEl = document.createElement('div');
      specialEl.className = day.holiday ? 'holiday-name' : 'jieqi-name';
      specialEl.textContent = day.holiday || day.jieQi;
      cell.appendChild(specialEl);
    }

    // Gregorian date
    const gregorianEl = document.createElement('div');
    gregorianEl.className = 'gregorian-date';
    gregorianEl.textContent = `${day.gregorianMonth}/${day.gregorianDay}`;
    cell.appendChild(gregorianEl);

    return cell;
  }

  /**
   * Create a day cell element for Gregorian view
   */
  createGregorianDayCell(day, todayGregorian, currentYear, currentMonth) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    // Handle empty cells
    if (day.empty) {
      cell.classList.add('empty');
      return cell;
    }

    // Check if this is today
    const isToday = this.isTodayGregorian(day, todayGregorian, currentYear, currentMonth);
    if (isToday) {
      cell.classList.add('today');
    }

    // Check for holiday
    if (day.holiday) {
      cell.classList.add('holiday');
    }

    // Check for solar term
    if (day.jieQi) {
      cell.classList.add('jieqi');
    }

    // Check for first day of lunar month
    if (day.isFirstDayOfLunarMonth) {
      cell.classList.add('lunar-first');
    }

    // Gregorian day number (primary)
    const gregorianDayEl = document.createElement('div');
    gregorianDayEl.className = 'gregorian-day';
    gregorianDayEl.textContent = day.gregorianDay;
    cell.appendChild(gregorianDayEl);

    // Holiday, solar term, or lunar day (priority: holiday > jieqi > lunar month name on 初一 > lunar day)
    const secondaryEl = document.createElement('div');
    if (day.holiday) {
      secondaryEl.className = 'holiday-name';
      secondaryEl.textContent = day.holiday;
    } else if (day.jieQi) {
      secondaryEl.className = 'jieqi-name';
      secondaryEl.textContent = day.jieQi;
    } else if (day.isFirstDayOfLunarMonth) {
      secondaryEl.className = 'lunar-month-name';
      secondaryEl.textContent = day.lunarMonthName;
    } else {
      secondaryEl.className = 'lunar-day-small';
      secondaryEl.textContent = day.lunarDayName;
    }
    cell.appendChild(secondaryEl);

    return cell;
  }

  /**
   * Check if a day is today (lunar view)
   */
  isTodayLunar(day, todayLunar, currentYear, currentMonth, isLeapMonth) {
    return (
      currentYear === todayLunar.year &&
      currentMonth === Math.abs(todayLunar.month) &&
      isLeapMonth === todayLunar.isLeapMonth &&
      day.lunarDay === todayLunar.day
    );
  }

  /**
   * Check if a day is today (Gregorian view)
   */
  isTodayGregorian(day, todayGregorian, currentYear, currentMonth) {
    return (
      currentYear === todayGregorian.year &&
      currentMonth === todayGregorian.month &&
      day.gregorianDay === todayGregorian.day
    );
  }
}

export default CalendarGrid;
