/**
 * Service wrapper around lunar-javascript library
 * This is the unified core logic shared by web, mini program, and chrome extension
 */
class LunarCalendarService {
  /**
   * Get current lunar date
   */
  getCurrentLunarDate() {
    const solar = Solar.fromDate(new Date());
    const lunar = solar.getLunar();
    return {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      isLeapMonth: lunar.getMonth() < 0
    };
  }

  /**
   * Get all days in a lunar month with their Gregorian dates
   */
  getLunarMonth(lunarYear, lunarMonth, isLeapMonth = false) {
    const month = isLeapMonth ? -Math.abs(lunarMonth) : lunarMonth;
    const lunarMonth_ = LunarMonth.fromYm(lunarYear, month);
    const dayCount = lunarMonth_.getDayCount();

    const days = [];
    for (let day = 1; day <= dayCount; day++) {
      const lunar = Lunar.fromYmd(lunarYear, month, day);
      const solar = lunar.getSolar();

      // Get solar term (节气) for this day
      const jieQi = lunar.getJieQi();

      // Get lunar holiday
      const holiday = this.getLunarHoliday(lunarMonth, day, isLeapMonth, dayCount);

      days.push({
        lunarDay: day,
        lunarDayName: lunar.getDayInChinese(),
        gregorianYear: solar.getYear(),
        gregorianMonth: solar.getMonth(),
        gregorianDay: solar.getDay(),
        jieQi: jieQi || null,
        holiday: holiday
      });
    }
    return days;
  }

  /**
   * Get lunar holiday for a specific date
   */
  getLunarHoliday(month, day, isLeapMonth, dayCount) {
    if (isLeapMonth) return null;

    // Special case: 除夕 is the last day of 腊月
    if (month === 12 && day === dayCount) {
      return '除夕';
    }

    const key = `${month}-${day}`;
    return LUNAR_HOLIDAYS[key] || null;
  }

  /**
   * Get Chinese year name with Gan-Zhi and zodiac
   */
  getChineseYearName(lunarYear) {
    const lunar = Lunar.fromYmd(lunarYear, 1, 1);
    const ganZhi = lunar.getYearInGanZhi();
    const zodiac = lunar.getYearShengXiao();
    return `${ganZhi}年 (${zodiac}年)`;
  }

  /**
   * Get Huangdi Era year (黄帝纪年)
   */
  getHuangdiYear(lunarYear) {
    const huangdiYear = lunarYear + 2697;
    return `黄帝纪年${huangdiYear}年`;
  }

  /**
   * Get raw Huangdi year number
   */
  getHuangdiYearNumber(lunarYear) {
    return lunarYear + 2697;
  }

  /**
   * Get Chinese month name
   */
  getChineseMonthName(lunarMonth, isLeapMonth = false) {
    const monthIndex = Math.abs(lunarMonth) - 1;
    const prefix = isLeapMonth ? '闰' : '';
    return prefix + MONTH_NAMES[monthIndex];
  }

  /**
   * Get leap month for a year (0 if none)
   */
  getLeapMonth(lunarYear) {
    const year = LunarYear.fromYear(lunarYear);
    return year.getLeapMonth();
  }

  /**
   * Get all months in a lunar year (including leap month if any)
   */
  getMonthsInYear(lunarYear) {
    const leapMonth = this.getLeapMonth(lunarYear);
    const months = [];

    for (let m = 1; m <= 12; m++) {
      months.push({ month: m, isLeapMonth: false });
      if (leapMonth === m) {
        months.push({ month: m, isLeapMonth: true });
      }
    }
    return months;
  }

  /**
   * Get current Gregorian date
   */
  getCurrentGregorianDate() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  }

  /**
   * Get all days in a Gregorian month with their lunar dates
   */
  getGregorianMonth(year, month) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the 1st
    for (let i = 0; i < startWeekday; i++) {
      days.push({ empty: true });
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const solar = Solar.fromYmd(year, month, day);
      const lunar = solar.getLunar();

      const lunarMonth = lunar.getMonth();
      const lunarDay = lunar.getDay();
      const isLeapMonth = lunarMonth < 0;

      const lunarMonthObj = LunarMonth.fromYm(lunar.getYear(), lunarMonth);
      const dayCount = lunarMonthObj.getDayCount();

      const jieQi = lunar.getJieQi();
      const holiday = this.getLunarHoliday(Math.abs(lunarMonth), lunarDay, isLeapMonth, dayCount);

      days.push({
        empty: false,
        gregorianDay: day,
        lunarDayName: lunar.getDayInChinese(),
        lunarMonthName: lunar.getMonthInChinese(),
        lunarDay: lunarDay,
        isFirstDayOfLunarMonth: lunarDay === 1,
        jieQi: jieQi || null,
        holiday: holiday
      });
    }

    return days;
  }

  /**
   * Get Gan-Zhi year name for a given year
   */
  getGanZhiYear(year) {
    const lunar = Lunar.fromYmd(year, 1, 1);
    return lunar.getYearInGanZhi();
  }
}
