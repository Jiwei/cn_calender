/**
 * XIALI Chrome Extension - Popup Script
 * Thin wrapper that delegates all logic to core LunarCalendarService
 */

// State
let viewMode = 'lunar';
let lunarYear, lunarMonth, isLeapMonth;
let gregorianYear, gregorianMonth;
let todayLunar, todayGregorian;
let calendarService;

// DOM Elements
const yearText = document.getElementById('yearText');
const huangdiYear = document.getElementById('huangdiYear');
const monthTitle = document.getElementById('monthTitle');
const yearSelect = document.getElementById('yearSelect');
const monthSelect = document.getElementById('monthSelect');
const todayBtn = document.getElementById('todayBtn');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const lunarViewBtn = document.getElementById('lunarViewBtn');
const gregorianViewBtn = document.getElementById('gregorianViewBtn');
const weekdayHeader = document.getElementById('weekdayHeader');
const calendarGrid = document.getElementById('calendarGrid');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  calendarService = new LunarCalendarService();

  // Get today's dates
  todayLunar = calendarService.getCurrentLunarDate();
  todayGregorian = calendarService.getCurrentGregorianDate();

  // Initialize state
  lunarYear = todayLunar.year;
  lunarMonth = Math.abs(todayLunar.month);
  isLeapMonth = todayLunar.isLeapMonth;
  gregorianYear = todayGregorian.year;
  gregorianMonth = todayGregorian.month;

  // Setup event listeners
  setupEventListeners();

  // Initial render
  render();
});

function setupEventListeners() {
  lunarViewBtn.addEventListener('click', () => switchView('lunar'));
  gregorianViewBtn.addEventListener('click', () => switchView('gregorian'));
  prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
  nextMonthBtn.addEventListener('click', () => navigateMonth(1));
  todayBtn.addEventListener('click', goToToday);
  yearSelect.addEventListener('change', onYearChange);
  monthSelect.addEventListener('change', onMonthChange);
}

function switchView(mode) {
  if (viewMode === mode) return;
  viewMode = mode;

  lunarViewBtn.classList.toggle('active', mode === 'lunar');
  gregorianViewBtn.classList.toggle('active', mode === 'gregorian');

  render();
}

function navigateMonth(direction) {
  if (viewMode === 'lunar') {
    navigateLunarMonth(direction);
  } else {
    navigateGregorianMonth(direction);
  }
}

function navigateLunarMonth(direction) {
  const monthsInYear = calendarService.getMonthsInYear(lunarYear);
  let currentIndex = monthsInYear.findIndex(
    m => m.month === lunarMonth && m.isLeapMonth === isLeapMonth
  );

  let newIndex = currentIndex + direction;

  if (newIndex < 0) {
    lunarYear--;
    const prevYearMonths = calendarService.getMonthsInYear(lunarYear);
    const lastMonth = prevYearMonths[prevYearMonths.length - 1];
    lunarMonth = lastMonth.month;
    isLeapMonth = lastMonth.isLeapMonth;
  } else if (newIndex >= monthsInYear.length) {
    lunarYear++;
    lunarMonth = 1;
    isLeapMonth = false;
  } else {
    lunarMonth = monthsInYear[newIndex].month;
    isLeapMonth = monthsInYear[newIndex].isLeapMonth;
  }

  render();
}

function navigateGregorianMonth(direction) {
  gregorianMonth += direction;

  if (gregorianMonth < 1) {
    gregorianYear--;
    gregorianMonth = 12;
  } else if (gregorianMonth > 12) {
    gregorianYear++;
    gregorianMonth = 1;
  }

  render();
}

function goToToday() {
  if (viewMode === 'lunar') {
    lunarYear = todayLunar.year;
    lunarMonth = Math.abs(todayLunar.month);
    isLeapMonth = todayLunar.isLeapMonth;
  } else {
    gregorianYear = todayGregorian.year;
    gregorianMonth = todayGregorian.month;
  }
  render();
}

function onYearChange() {
  const year = parseInt(yearSelect.value);

  if (viewMode === 'lunar') {
    const monthsInYear = calendarService.getMonthsInYear(year);
    const currentMonthExists = monthsInYear.some(
      m => m.month === lunarMonth && m.isLeapMonth === isLeapMonth
    );

    lunarYear = year;
    if (!currentMonthExists) {
      isLeapMonth = false;
    }
  } else {
    gregorianYear = year;
  }

  render();
}

function onMonthChange() {
  const value = monthSelect.value;

  if (viewMode === 'lunar') {
    const [month, leap] = value.split('-');
    lunarMonth = parseInt(month);
    isLeapMonth = leap === 'true';
  } else {
    gregorianMonth = parseInt(value);
  }

  render();
}

function isShowingToday() {
  if (viewMode === 'lunar') {
    return lunarYear === todayLunar.year &&
           lunarMonth === Math.abs(todayLunar.month) &&
           isLeapMonth === todayLunar.isLeapMonth;
  } else {
    return gregorianYear === todayGregorian.year &&
           gregorianMonth === todayGregorian.month;
  }
}

function populateYearSelect() {
  const currentYear = viewMode === 'lunar' ? lunarYear : gregorianYear;
  const startYear = currentYear - 50;
  const endYear = currentYear + 50;

  yearSelect.innerHTML = '';

  for (let year = startYear; year <= endYear; year++) {
    const option = document.createElement('option');
    option.value = year;

    const lunar = Lunar.fromYmd(year, 1, 1);
    const huangdi = year + 2697;

    if (viewMode === 'lunar') {
      option.textContent = `${huangdi}年 (公历${year}, ${lunar.getYearInGanZhi()})`;
    } else {
      option.textContent = `${year}年 (黄帝${huangdi}, ${lunar.getYearInGanZhi()})`;
    }

    if (year === currentYear) {
      option.selected = true;
    }

    yearSelect.appendChild(option);
  }
}

function populateMonthSelect() {
  monthSelect.innerHTML = '';

  if (viewMode === 'lunar') {
    const monthsInYear = calendarService.getMonthsInYear(lunarYear);
    monthsInYear.forEach(m => {
      const option = document.createElement('option');
      option.value = `${m.month}-${m.isLeapMonth}`;
      option.textContent = calendarService.getChineseMonthName(m.month, m.isLeapMonth);

      if (m.month === lunarMonth && m.isLeapMonth === isLeapMonth) {
        option.selected = true;
      }

      monthSelect.appendChild(option);
    });
  } else {
    GREGORIAN_MONTHS.forEach((name, index) => {
      const option = document.createElement('option');
      option.value = index + 1;
      option.textContent = name;

      if (index + 1 === gregorianMonth) {
        option.selected = true;
      }

      monthSelect.appendChild(option);
    });
  }
}

function render() {
  // Update today button visibility
  todayBtn.classList.toggle('hidden', isShowingToday());

  // Populate selectors
  populateYearSelect();
  populateMonthSelect();

  if (viewMode === 'lunar') {
    renderLunar();
  } else {
    renderGregorian();
  }
}

function renderLunar() {
  // Update header
  yearText.textContent = calendarService.getChineseYearName(lunarYear);
  huangdiYear.textContent = ' · ' + calendarService.getHuangdiYear(lunarYear);
  monthTitle.textContent = calendarService.getChineseMonthName(lunarMonth, isLeapMonth);

  // Hide weekday header
  weekdayHeader.style.display = 'none';

  // Get days
  const days = calendarService.getLunarMonth(lunarYear, lunarMonth, isLeapMonth);

  // Render grid
  calendarGrid.innerHTML = '';

  days.forEach(day => {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    // Check if today
    const isToday = lunarYear === todayLunar.year &&
                    lunarMonth === Math.abs(todayLunar.month) &&
                    isLeapMonth === todayLunar.isLeapMonth &&
                    day.lunarDay === todayLunar.day;

    if (isToday) cell.classList.add('today');
    if (day.holiday) cell.classList.add('holiday');
    if (day.jieQi && !day.holiday) cell.classList.add('jieqi');

    // Lunar day
    const lunarDayEl = document.createElement('span');
    lunarDayEl.className = 'lunar-day';
    lunarDayEl.textContent = day.lunarDayName;
    cell.appendChild(lunarDayEl);

    // Holiday or Jieqi
    if (day.holiday) {
      const holidayEl = document.createElement('span');
      holidayEl.className = 'holiday-name';
      holidayEl.textContent = day.holiday;
      cell.appendChild(holidayEl);
    } else if (day.jieQi) {
      const jieqiEl = document.createElement('span');
      jieqiEl.className = 'jieqi-name';
      jieqiEl.textContent = day.jieQi;
      cell.appendChild(jieqiEl);
    }

    // Gregorian date
    const gregEl = document.createElement('span');
    gregEl.className = 'gregorian-date';
    gregEl.textContent = `${day.gregorianMonth}/${day.gregorianDay}`;
    cell.appendChild(gregEl);

    calendarGrid.appendChild(cell);
  });
}

function renderGregorian() {
  // Update header
  yearText.textContent = `${gregorianYear}年`;
  huangdiYear.textContent = '';
  monthTitle.textContent = GREGORIAN_MONTHS[gregorianMonth - 1];

  // Show weekday header
  weekdayHeader.style.display = 'grid';
  weekdayHeader.innerHTML = '';
  WEEKDAYS.forEach(day => {
    const cell = document.createElement('div');
    cell.className = 'weekday-cell';
    cell.textContent = day;
    weekdayHeader.appendChild(cell);
  });

  // Get days
  const days = calendarService.getGregorianMonth(gregorianYear, gregorianMonth);

  // Render grid
  calendarGrid.innerHTML = '';

  days.forEach(day => {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    if (day.empty) {
      cell.classList.add('empty');
      calendarGrid.appendChild(cell);
      return;
    }

    // Check if today
    const isToday = gregorianYear === todayGregorian.year &&
                    gregorianMonth === todayGregorian.month &&
                    day.gregorianDay === todayGregorian.day;

    if (isToday) cell.classList.add('today');
    if (day.holiday) cell.classList.add('holiday');
    if (day.jieQi && !day.holiday) cell.classList.add('jieqi');
    if (day.isFirstDayOfLunarMonth) cell.classList.add('lunar-first');

    // Gregorian day
    const gregDayEl = document.createElement('span');
    gregDayEl.className = 'gregorian-day';
    gregDayEl.textContent = day.gregorianDay;
    cell.appendChild(gregDayEl);

    // Holiday, Jieqi, or Lunar info
    if (day.holiday) {
      const holidayEl = document.createElement('span');
      holidayEl.className = 'holiday-name';
      holidayEl.textContent = day.holiday;
      cell.appendChild(holidayEl);
    } else if (day.jieQi) {
      const jieqiEl = document.createElement('span');
      jieqiEl.className = 'jieqi-name';
      jieqiEl.textContent = day.jieQi;
      cell.appendChild(jieqiEl);
    } else if (day.isFirstDayOfLunarMonth) {
      const monthEl = document.createElement('span');
      monthEl.className = 'lunar-month-name';
      monthEl.textContent = day.lunarMonthName + '月';
      cell.appendChild(monthEl);
    } else {
      const lunarEl = document.createElement('span');
      lunarEl.className = 'lunar-day-small';
      lunarEl.textContent = day.lunarDayName;
      cell.appendChild(lunarEl);
    }

    calendarGrid.appendChild(cell);
  });
}
