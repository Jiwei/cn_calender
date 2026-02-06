/**
 * XIALI Core Module
 * Unified business logic shared by web and mini program
 */

import LunarCalendarService from './LunarCalendarService.js';
import {
  MONTH_NAMES,
  DAY_NAMES,
  LUNAR_HOLIDAYS,
  GREGORIAN_MONTHS,
  WEEKDAYS
} from './constants.js';

// Support both CommonJS and ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LunarCalendarService,
    MONTH_NAMES,
    DAY_NAMES,
    LUNAR_HOLIDAYS,
    GREGORIAN_MONTHS,
    WEEKDAYS
  };
}

export {
  LunarCalendarService,
  MONTH_NAMES,
  DAY_NAMES,
  LUNAR_HOLIDAYS,
  GREGORIAN_MONTHS,
  WEEKDAYS
};
