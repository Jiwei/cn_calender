/**
 * XIALI Mini Program - Main Page
 * Thin wrapper that delegates all logic to core LunarCalendarService
 */
const { Lunar, Solar, LunarMonth, LunarYear } = require('lunar-javascript');
const { MONTH_NAMES, LUNAR_HOLIDAYS, GREGORIAN_MONTHS, WEEKDAYS } = require('../../core/constants');

// Make lunar-javascript available globally for LunarCalendarService
global.Lunar = Lunar;
global.Solar = Solar;
global.LunarMonth = LunarMonth;
global.LunarYear = LunarYear;

const LunarCalendarService = require('../../core/LunarCalendarService');

Page({
  data: {
    viewMode: 'lunar',

    // Lunar view state
    lunarYear: null,
    lunarMonth: null,
    isLeapMonth: false,

    // Gregorian view state
    gregorianYear: null,
    gregorianMonth: null,

    // Display data
    yearTitle: '',
    huangdiYearText: '',
    showHuangdiYear: true,
    monthTitle: '',
    days: [],
    weekdays: WEEKDAYS,
    showWeekdays: false,

    // Selectors
    yearOptions: [],
    yearIndex: 50,
    monthOptions: [],
    monthIndex: 0,

    // Today button
    showTodayBtn: false,

    // Today references
    todayLunar: null,
    todayGregorian: null,

    // Tip modal
    showTipModal: false,
    qrError: false
  },

  onLoad() {
    this.calendarService = new LunarCalendarService();

    // Get today's dates
    const todayLunar = this.calendarService.getCurrentLunarDate();
    const todayGregorian = this.calendarService.getCurrentGregorianDate();

    // Initialize state
    this.setData({
      todayLunar,
      todayGregorian,
      lunarYear: todayLunar.year,
      lunarMonth: Math.abs(todayLunar.month),
      isLeapMonth: todayLunar.isLeapMonth,
      gregorianYear: todayGregorian.year,
      gregorianMonth: todayGregorian.month
    }, () => {
      this.render();
    });
  },

  // View toggle
  onViewToggle(e) {
    const mode = e.currentTarget.dataset.mode;
    if (this.data.viewMode === mode) return;

    this.setData({ viewMode: mode }, () => {
      this.render();
    });
  },

  // Today button
  onTodayTap() {
    const { viewMode, todayLunar, todayGregorian } = this.data;

    if (viewMode === 'lunar') {
      this.setData({
        lunarYear: todayLunar.year,
        lunarMonth: Math.abs(todayLunar.month),
        isLeapMonth: todayLunar.isLeapMonth
      }, () => this.render());
    } else {
      this.setData({
        gregorianYear: todayGregorian.year,
        gregorianMonth: todayGregorian.month
      }, () => this.render());
    }
  },

  // Year selector change
  onYearChange(e) {
    const index = e.detail.value;
    const year = this.data.yearOptions[index].value;

    if (this.data.viewMode === 'lunar') {
      // Check if current month is valid for new year
      const monthsInYear = this.calendarService.getMonthsInYear(year);
      const currentMonthExists = monthsInYear.some(
        m => m.month === this.data.lunarMonth && m.isLeapMonth === this.data.isLeapMonth
      );

      this.setData({
        lunarYear: year,
        yearIndex: index,
        isLeapMonth: currentMonthExists ? this.data.isLeapMonth : false
      }, () => this.render());
    } else {
      this.setData({
        gregorianYear: year,
        yearIndex: index
      }, () => this.render());
    }
  },

  // Month selector change
  onMonthChange(e) {
    const index = e.detail.value;
    const monthOption = this.data.monthOptions[index];

    if (this.data.viewMode === 'lunar') {
      this.setData({
        lunarMonth: monthOption.month,
        isLeapMonth: monthOption.isLeapMonth,
        monthIndex: index
      }, () => this.render());
    } else {
      this.setData({
        gregorianMonth: monthOption.value,
        monthIndex: index
      }, () => this.render());
    }
  },

  // Month navigation
  onPrevMonth() {
    this.navigateMonth(-1);
  },

  onNextMonth() {
    this.navigateMonth(1);
  },

  navigateMonth(direction) {
    if (this.data.viewMode === 'lunar') {
      this.navigateLunarMonth(direction);
    } else {
      this.navigateGregorianMonth(direction);
    }
  },

  navigateLunarMonth(direction) {
    const { lunarYear, lunarMonth, isLeapMonth } = this.data;
    const monthsInYear = this.calendarService.getMonthsInYear(lunarYear);

    let currentIndex = monthsInYear.findIndex(
      m => m.month === lunarMonth && m.isLeapMonth === isLeapMonth
    );

    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
      const newYear = lunarYear - 1;
      const prevYearMonths = this.calendarService.getMonthsInYear(newYear);
      const lastMonth = prevYearMonths[prevYearMonths.length - 1];
      this.setData({
        lunarYear: newYear,
        lunarMonth: lastMonth.month,
        isLeapMonth: lastMonth.isLeapMonth
      }, () => this.render());
    } else if (newIndex >= monthsInYear.length) {
      this.setData({
        lunarYear: lunarYear + 1,
        lunarMonth: 1,
        isLeapMonth: false
      }, () => this.render());
    } else {
      this.setData({
        lunarMonth: monthsInYear[newIndex].month,
        isLeapMonth: monthsInYear[newIndex].isLeapMonth
      }, () => this.render());
    }
  },

  navigateGregorianMonth(direction) {
    let { gregorianYear, gregorianMonth } = this.data;
    gregorianMonth += direction;

    if (gregorianMonth < 1) {
      gregorianYear--;
      gregorianMonth = 12;
    } else if (gregorianMonth > 12) {
      gregorianYear++;
      gregorianMonth = 1;
    }

    this.setData({ gregorianYear, gregorianMonth }, () => this.render());
  },

  // Check if showing today's month
  isShowingToday() {
    const { viewMode, lunarYear, lunarMonth, isLeapMonth, gregorianYear, gregorianMonth, todayLunar, todayGregorian } = this.data;

    if (viewMode === 'lunar') {
      return lunarYear === todayLunar.year &&
             lunarMonth === Math.abs(todayLunar.month) &&
             isLeapMonth === todayLunar.isLeapMonth;
    } else {
      return gregorianYear === todayGregorian.year &&
             gregorianMonth === todayGregorian.month;
    }
  },

  // Populate year options
  populateYearOptions() {
    const { viewMode, lunarYear, gregorianYear } = this.data;
    const currentYear = viewMode === 'lunar' ? lunarYear : gregorianYear;
    const startYear = currentYear - 50;
    const endYear = currentYear + 50;

    const yearOptions = [];
    let yearIndex = 50;

    for (let year = startYear; year <= endYear; year++) {
      const lunar = Lunar.fromYmd(year, 1, 1);
      const huangdiYear = year + 2697;

      let label;
      if (viewMode === 'lunar') {
        label = `${huangdiYear}年 (公历${year}, ${lunar.getYearInGanZhi()})`;
      } else {
        label = `${year}年 (黄帝${huangdiYear}, ${lunar.getYearInGanZhi()})`;
      }

      yearOptions.push({ value: year, label });

      if (year === currentYear) {
        yearIndex = yearOptions.length - 1;
      }
    }

    return { yearOptions, yearIndex };
  },

  // Populate month options
  populateMonthOptions() {
    const { viewMode, lunarYear, lunarMonth, isLeapMonth, gregorianMonth } = this.data;
    const monthOptions = [];
    let monthIndex = 0;

    if (viewMode === 'lunar') {
      const monthsInYear = this.calendarService.getMonthsInYear(lunarYear);
      monthsInYear.forEach((m, index) => {
        const label = this.calendarService.getChineseMonthName(m.month, m.isLeapMonth);
        monthOptions.push({ month: m.month, isLeapMonth: m.isLeapMonth, label });

        if (m.month === lunarMonth && m.isLeapMonth === isLeapMonth) {
          monthIndex = index;
        }
      });
    } else {
      GREGORIAN_MONTHS.forEach((name, index) => {
        monthOptions.push({ value: index + 1, label: name });
        if (index + 1 === gregorianMonth) {
          monthIndex = index;
        }
      });
    }

    return { monthOptions, monthIndex };
  },

  // Main render function
  render() {
    const { viewMode } = this.data;

    // Update today button visibility
    const showTodayBtn = !this.isShowingToday();

    // Populate selectors
    const { yearOptions, yearIndex } = this.populateYearOptions();
    const { monthOptions, monthIndex } = this.populateMonthOptions();

    if (viewMode === 'lunar') {
      this.renderLunar(yearOptions, yearIndex, monthOptions, monthIndex, showTodayBtn);
    } else {
      this.renderGregorian(yearOptions, yearIndex, monthOptions, monthIndex, showTodayBtn);
    }
  },

  renderLunar(yearOptions, yearIndex, monthOptions, monthIndex, showTodayBtn) {
    const { lunarYear, lunarMonth, isLeapMonth, todayLunar } = this.data;

    const yearTitle = this.calendarService.getChineseYearName(lunarYear);
    const huangdiYearText = ' · ' + this.calendarService.getHuangdiYear(lunarYear);
    const monthTitle = this.calendarService.getChineseMonthName(lunarMonth, isLeapMonth);

    const days = this.calendarService.getLunarMonth(lunarYear, lunarMonth, isLeapMonth);

    // Add isToday flag to each day
    days.forEach(day => {
      day.isToday = lunarYear === todayLunar.year &&
                    lunarMonth === Math.abs(todayLunar.month) &&
                    isLeapMonth === todayLunar.isLeapMonth &&
                    day.lunarDay === todayLunar.day;
    });

    this.setData({
      yearTitle,
      huangdiYearText,
      showHuangdiYear: true,
      monthTitle,
      days,
      showWeekdays: false,
      yearOptions,
      yearIndex,
      monthOptions,
      monthIndex,
      showTodayBtn
    });
  },

  renderGregorian(yearOptions, yearIndex, monthOptions, monthIndex, showTodayBtn) {
    const { gregorianYear, gregorianMonth, todayGregorian } = this.data;

    const yearTitle = `${gregorianYear}年`;
    const monthTitle = GREGORIAN_MONTHS[gregorianMonth - 1];

    const days = this.calendarService.getGregorianMonth(gregorianYear, gregorianMonth);

    // Add isToday flag to each day
    days.forEach(day => {
      if (!day.empty) {
        day.isToday = gregorianYear === todayGregorian.year &&
                      gregorianMonth === todayGregorian.month &&
                      day.gregorianDay === todayGregorian.day;
      }
    });

    this.setData({
      yearTitle,
      huangdiYearText: '',
      showHuangdiYear: false,
      monthTitle,
      days,
      showWeekdays: true,
      yearOptions,
      yearIndex,
      monthOptions,
      monthIndex,
      showTodayBtn
    });
  },

  // Tip modal handlers
  onTipTap() {
    this.setData({ showTipModal: true });
  },

  onCloseTipModal() {
    this.setData({ showTipModal: false });
  },

  onModalOverlayTap() {
    this.setData({ showTipModal: false });
  },

  preventBubble() {
    // Prevent tap from bubbling to overlay
  },

  onQrError() {
    this.setData({ qrError: true });
  }
});
