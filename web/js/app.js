import LunarCalendarService from '../core/LunarCalendarService.js';
import CalendarGrid from './CalendarGrid.js';
import { GREGORIAN_MONTHS } from '../core/constants.js';

class App {
  constructor() {
    this.calendarService = new LunarCalendarService();
    this.calendarGrid = new CalendarGrid('calendarGrid', 'weekdayHeader');

    // View mode: 'lunar' or 'gregorian'
    this.viewMode = 'lunar';

    // Lunar view state
    this.lunarYear = null;
    this.lunarMonth = null;
    this.isLeapMonth = false;
    this.todayLunar = this.calendarService.getCurrentLunarDate();

    // Gregorian view state
    this.gregorianYear = null;
    this.gregorianMonth = null;
    this.todayGregorian = this.calendarService.getCurrentGregorianDate();

    this.init();
  }

  init() {
    // Set initial lunar month to today
    this.lunarYear = this.todayLunar.year;
    this.lunarMonth = Math.abs(this.todayLunar.month);
    this.isLeapMonth = this.todayLunar.isLeapMonth;

    // Set initial Gregorian month to today
    this.gregorianYear = this.todayGregorian.year;
    this.gregorianMonth = this.todayGregorian.month;

    // Bind navigation events
    document.getElementById('prevMonth').addEventListener('click', () => this.navigateMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => this.navigateMonth(1));

    // Bind view toggle events
    document.getElementById('lunarViewBtn').addEventListener('click', () => this.setViewMode('lunar'));
    document.getElementById('gregorianViewBtn').addEventListener('click', () => this.setViewMode('gregorian'));

    // Bind today button
    document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());

    // Bind select change events
    document.getElementById('yearSelect').addEventListener('change', (e) => this.onYearSelect(e));
    document.getElementById('monthSelect').addEventListener('change', (e) => this.onMonthSelect(e));

    // Bind tip modal events
    document.getElementById('tipBtn').addEventListener('click', () => this.showTipModal());
    document.getElementById('modalClose').addEventListener('click', () => this.hideTipModal());
    document.getElementById('tipModal').addEventListener('click', (e) => {
      if (e.target.id === 'tipModal') this.hideTipModal();
    });

    // Initial render
    this.render();
  }

  showTipModal() {
    document.getElementById('tipModal').classList.add('show');
  }

  hideTipModal() {
    document.getElementById('tipModal').classList.remove('show');
  }

  setViewMode(mode) {
    if (this.viewMode === mode) return;

    this.viewMode = mode;

    // Update toggle button states
    document.getElementById('lunarViewBtn').classList.toggle('active', mode === 'lunar');
    document.getElementById('gregorianViewBtn').classList.toggle('active', mode === 'gregorian');

    this.render();
  }

  goToToday() {
    if (this.viewMode === 'lunar') {
      this.lunarYear = this.todayLunar.year;
      this.lunarMonth = Math.abs(this.todayLunar.month);
      this.isLeapMonth = this.todayLunar.isLeapMonth;
    } else {
      this.gregorianYear = this.todayGregorian.year;
      this.gregorianMonth = this.todayGregorian.month;
    }
    this.render();
  }

  onYearSelect(e) {
    const value = parseInt(e.target.value);
    if (this.viewMode === 'lunar') {
      this.lunarYear = value;
      // Check if current month is valid for new year (leap month handling)
      const monthsInYear = this.calendarService.getMonthsInYear(this.lunarYear);
      const currentMonthExists = monthsInYear.some(
        m => m.month === this.lunarMonth && m.isLeapMonth === this.isLeapMonth
      );
      if (!currentMonthExists) {
        this.isLeapMonth = false;
      }
    } else {
      this.gregorianYear = value;
    }
    this.render();
  }

  onMonthSelect(e) {
    const value = e.target.value;
    if (this.viewMode === 'lunar') {
      // Value format: "month-isLeap" e.g., "6-false" or "6-true"
      const [month, isLeap] = value.split('-');
      this.lunarMonth = parseInt(month);
      this.isLeapMonth = isLeap === 'true';
    } else {
      this.gregorianMonth = parseInt(value);
    }
    this.render();
  }

  isShowingToday() {
    if (this.viewMode === 'lunar') {
      return (
        this.lunarYear === this.todayLunar.year &&
        this.lunarMonth === Math.abs(this.todayLunar.month) &&
        this.isLeapMonth === this.todayLunar.isLeapMonth
      );
    } else {
      return (
        this.gregorianYear === this.todayGregorian.year &&
        this.gregorianMonth === this.todayGregorian.month
      );
    }
  }

  updateTodayButtonVisibility() {
    const todayBtn = document.getElementById('todayBtn');
    if (this.isShowingToday()) {
      todayBtn.classList.add('hidden');
    } else {
      todayBtn.classList.remove('hidden');
    }
  }

  populateYearSelect() {
    const yearSelect = document.getElementById('yearSelect');
    yearSelect.innerHTML = '';

    const currentYear = this.viewMode === 'lunar' ? this.lunarYear : this.gregorianYear;
    const startYear = currentYear - 50;
    const endYear = currentYear + 50;

    for (let year = startYear; year <= endYear; year++) {
      const option = document.createElement('option');
      option.value = year;
      const lunar = Lunar.fromYmd(year, 1, 1);
      const huangdiYear = year + 2697;
      if (this.viewMode === 'lunar') {
        option.textContent = `${huangdiYear}年 (公历${year}, ${lunar.getYearInGanZhi()})`;
      } else {
        option.textContent = `${year}年 (黄帝${huangdiYear}, ${lunar.getYearInGanZhi()})`;
      }
      if (year === currentYear) {
        option.selected = true;
      }
      yearSelect.appendChild(option);
    }
  }

  populateMonthSelect() {
    const monthSelect = document.getElementById('monthSelect');
    monthSelect.innerHTML = '';

    if (this.viewMode === 'lunar') {
      const monthsInYear = this.calendarService.getMonthsInYear(this.lunarYear);
      monthsInYear.forEach(m => {
        const option = document.createElement('option');
        option.value = `${m.month}-${m.isLeapMonth}`;
        option.textContent = this.calendarService.getChineseMonthName(m.month, m.isLeapMonth);
        if (m.month === this.lunarMonth && m.isLeapMonth === this.isLeapMonth) {
          option.selected = true;
        }
        monthSelect.appendChild(option);
      });
    } else {
      GREGORIAN_MONTHS.forEach((name, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = name;
        if (index + 1 === this.gregorianMonth) {
          option.selected = true;
        }
        monthSelect.appendChild(option);
      });
    }
  }

  render() {
    // Update today button visibility first to avoid delay
    this.updateTodayButtonVisibility();

    // Populate selects
    this.populateYearSelect();
    this.populateMonthSelect();

    if (this.viewMode === 'lunar') {
      this.renderLunar();
    } else {
      this.renderGregorian();
    }
  }

  renderLunar() {
    // Update header
    const yearText = document.getElementById('yearText');
    const monthTitle = document.getElementById('monthTitle');
    const huangdiYear = document.getElementById('huangdiYear');

    yearText.textContent = this.calendarService.getChineseYearName(this.lunarYear);
    huangdiYear.textContent = ' · ' + this.calendarService.getHuangdiYear(this.lunarYear);
    huangdiYear.style.display = 'inline';
    monthTitle.textContent = this.calendarService.getChineseMonthName(this.lunarMonth, this.isLeapMonth);

    // Get month data and render grid
    const days = this.calendarService.getLunarMonth(
      this.lunarYear,
      this.lunarMonth,
      this.isLeapMonth
    );

    this.calendarGrid.renderLunar(
      days,
      this.todayLunar,
      this.lunarYear,
      this.lunarMonth,
      this.isLeapMonth
    );
  }

  renderGregorian() {
    // Update header
    const yearText = document.getElementById('yearText');
    const monthTitle = document.getElementById('monthTitle');
    const huangdiYear = document.getElementById('huangdiYear');

    yearText.textContent = `${this.gregorianYear}年`;
    huangdiYear.style.display = 'none';
    monthTitle.textContent = GREGORIAN_MONTHS[this.gregorianMonth - 1];

    // Get month data and render grid
    const days = this.calendarService.getGregorianMonth(
      this.gregorianYear,
      this.gregorianMonth
    );

    this.calendarGrid.renderGregorian(
      days,
      this.todayGregorian,
      this.gregorianYear,
      this.gregorianMonth
    );
  }

  navigateMonth(direction) {
    if (this.viewMode === 'lunar') {
      this.navigateLunarMonth(direction);
    } else {
      this.navigateGregorianMonth(direction);
    }
  }

  navigateLunarMonth(direction) {
    const monthsInYear = this.calendarService.getMonthsInYear(this.lunarYear);

    // Find current position in months array
    let currentIndex = monthsInYear.findIndex(
      m => m.month === this.lunarMonth && m.isLeapMonth === this.isLeapMonth
    );

    // Calculate new index
    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
      // Go to previous year's last month
      this.lunarYear--;
      const prevYearMonths = this.calendarService.getMonthsInYear(this.lunarYear);
      const lastMonth = prevYearMonths[prevYearMonths.length - 1];
      this.lunarMonth = lastMonth.month;
      this.isLeapMonth = lastMonth.isLeapMonth;
    } else if (newIndex >= monthsInYear.length) {
      // Go to next year's first month
      this.lunarYear++;
      this.lunarMonth = 1;
      this.isLeapMonth = false;
    } else {
      // Stay in current year
      this.lunarMonth = monthsInYear[newIndex].month;
      this.isLeapMonth = monthsInYear[newIndex].isLeapMonth;
    }

    this.render();
  }

  navigateGregorianMonth(direction) {
    this.gregorianMonth += direction;

    if (this.gregorianMonth < 1) {
      this.gregorianYear--;
      this.gregorianMonth = 12;
    } else if (this.gregorianMonth > 12) {
      this.gregorianYear++;
      this.gregorianMonth = 1;
    }

    this.render();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
