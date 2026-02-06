# XIALI Project Notes

## lunar-javascript Library API

When using the lunar-javascript library, be aware of which methods belong to which objects:

### Lunar object methods:
- `lunar.getJieQi()` - Get solar term (节气) for this day
- `lunar.getYear()`, `lunar.getMonth()`, `lunar.getDay()` - Get lunar date parts
- `lunar.getYearInGanZhi()` - Get year in Gan-Zhi format (e.g., 甲辰)
- `lunar.getYearShengXiao()` - Get zodiac animal
- `lunar.getDayInChinese()` - Get Chinese day name (e.g., 初一)
- `lunar.getMonthInChinese()` - Get Chinese month name (e.g., 正月)
- `lunar.getSolar()` - Convert to Solar object

### Solar object methods:
- `solar.getYear()`, `solar.getMonth()`, `solar.getDay()` - Get Gregorian date parts
- `solar.getLunar()` - Convert to Lunar object

### LunarMonth object methods:
- `LunarMonth.fromYm(year, month)` - Create from lunar year and month
- `lunarMonth.getDayCount()` - Get number of days in the month (29 or 30)

### LunarYear object methods:
- `LunarYear.fromYear(year)` - Create from lunar year
- `lunarYear.getLeapMonth()` - Get leap month number (0 if none)

**Important:** `getJieQi()` is a method on `Lunar`, NOT on `Solar`. Do not call `solar.getJieQi()`.

## Architecture Notes

### Dual Calendar View
The app supports two view modes:
- **Lunar view (农历)**: Native Chinese calendar grid, days flow continuously without week alignment
- **Gregorian view (公历)**: Standard calendar grid with weekday columns (日一二三四五六)

State is maintained separately for each view:
- Lunar: `lunarYear`, `lunarMonth`, `isLeapMonth`
- Gregorian: `gregorianYear`, `gregorianMonth`

### CalendarGrid Constructor
`CalendarGrid` requires two container IDs:
- `containerId` - for the day cells grid
- `weekdayHeaderId` - for the weekday header (shown only in Gregorian view)

## UI/UX Guidelines

### Layout Stability
When elements need to show/hide based on state, use `visibility: hidden` instead of `display: none` to maintain stable layout and prevent content jumping. Example:
```css
.today-btn.hidden {
  visibility: hidden;
}
```
This keeps the element's space reserved even when hidden, preventing layout shifts when switching views or states.

## Project Architecture

### Unified Core Pattern
The project uses a unified core architecture where business logic is shared across platforms:

```
cn_calender/
├── core/                    # Shared business logic (ES6 modules)
│   ├── LunarCalendarService.js
│   ├── constants.js
│   └── index.js
├── web/                     # Web app wrapper
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js, CalendarGrid.js
└── miniprogram/             # WeChat mini program wrapper
    ├── core/                # CommonJS version of core
    ├── pages/index/
    └── components/calendar-grid/
```

### Core vs Wrapper Responsibilities

**Core (shared):**
- All calendar calculations
- Holiday and 节气 lookups
- Date conversions
- Constants (month names, holidays, weekdays)

**Wrappers (platform-specific):**
- DOM/WXML rendering
- Event handling
- State management (setData vs class properties)
- Styling (CSS vs WXSS)

### Module System
- **Web (core/)**: ES6 modules with `export`/`import`
- **Mini Program (miniprogram/core/)**: CommonJS with `module.exports`/`require`

The core files support both via conditional exports:
```javascript
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ... };
}
export { ... };
```

### Mini Program Notes
- lunar-javascript globals (Lunar, Solar, LunarMonth, LunarYear) must be set on `global` before using LunarCalendarService
- Use `rpx` units instead of `px` (750rpx = screen width)
- CSS Grid has limited support; prefer flexbox
- Picker component for dropdowns instead of `<select>`
