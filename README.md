# XIALI - 中国农历

## Project Overview

XIALI is a calendar app showing native Chinese Lunisolar calendar (中国农历). Different from common calendar apps that only show corresponding Chinese calendar dates on a Gregorian calendar grid, XIALI does the opposite - showing a native Chinese calendar grid.

## Features

### Core Features
- **Native Chinese Lunar Calendar Grid** - Display lunar months with Chinese day names (初一, 初二, etc.)
- **Dual Calendar View** - Switch between 农历 (Lunar) and 公历 (Gregorian) views
- **Today Highlighting** - Current date is highlighted with "今" badge

### Calendar Information
- **干支纪年** - Chinese year naming with Heavenly Stems and Earthly Branches (e.g., 乙巳年)
- **生肖** - Chinese zodiac animal for each year (e.g., 蛇年)
- **黄帝纪年** - Huangdi Era year display (e.g., 黄帝纪年4722年)
- **节气** - 24 Solar Terms displayed on corresponding dates
- **传统节日** - Chinese traditional holidays (春节, 元宵节, 端午节, 中秋节, etc.)
- **闰月** - Proper handling of leap months in the lunar calendar

### Navigation
- **Month Navigation** - Previous/Next month buttons
- **Year Selector** - Dropdown to quickly jump to any year (±50 years range) with Huangdi era, Gregorian year, and 干支年
- **Month Selector** - Dropdown to quickly select any month (including leap months)
- **Today Button** - Quick navigation back to current date (auto-hides when viewing current month)

### Gregorian View Features
- **Weekday Headers** - Display 日一二三四五六 column headers
- **Lunar Date Reference** - Show corresponding lunar date below each Gregorian date
- **Lunar Month Start** - Highlight first day of lunar month (初一) with month name

## Platforms

### Web App
Browser-based web application with full feature support.

**Live Demo:** https://jiwei.github.io/cn_calender/

### Chrome Extension
Browser extension for quick access to the Chinese calendar from your browser toolbar.

### WeChat Mini Program
Native WeChat mini program with the same features, sharing unified core logic with the web app.

## Tech Stack
- **Core Logic**: Vanilla JavaScript (ES6+) - shared across platforms
- **Web**: HTML5, CSS3 with CSS Grid
- **Mini Program**: WXML, WXSS, WeChat Component System
- **Calendar Library**: [lunar-javascript](https://github.com/6tail/lunar-javascript)

## Project Structure

```
cn_calender/
├── README.md
├── CLAUDE.md                         # Development notes
│
├── core/                             # Unified core logic (shared)
│   ├── LunarCalendarService.js       # Calendar calculations
│   ├── constants.js                  # Chinese text constants
│   └── index.js                      # Module exports
│
├── web/                              # Web app
│   ├── index.html                    # Entry point
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js                    # Web-specific app logic
│       └── CalendarGrid.js           # DOM rendering
│
├── chrome-extension/                 # Chrome extension
│   ├── manifest.json                 # Extension manifest
│   ├── popup.html                    # Popup UI
│   ├── popup.js                      # Popup logic
│   ├── popup.css                     # Popup styles
│   └── icons/                        # Extension icons
│
└── miniprogram/                      # WeChat mini program
    ├── app.js                        # Mini program entry
    ├── app.json                      # Global config
    ├── app.wxss                      # Global styles
    ├── project.config.json
    ├── core/                         # Core logic (CommonJS version)
    ├── components/
    │   └── calendar-grid/            # Calendar grid component
    └── pages/
        └── index/                    # Main page
```

## Usage

### Web App
```bash
cd cn_calender/web
python3 -m http.server 8000
# Open http://localhost:8000
```

### WeChat Mini Program
1. Open `miniprogram/` folder in WeChat DevTools
2. Run `npm install` in the miniprogram folder
3. Click "Build npm" in WeChat DevTools
4. Preview in simulator or scan QR code for device testing

### Chrome Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension/` folder
5. The extension icon will appear in your toolbar

### Deploy to GitHub Pages
1. Push your code to GitHub
2. The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically deploy the `web/` folder
3. Access your app at `https://<username>.github.io/<repo-name>/`

## Architecture

The project uses a **unified core** architecture:

```
┌─────────────────────────────────────┐
│         SHARED CORE (100%)          │
│  - LunarCalendarService.js          │
│  - constants.js                     │
└─────────────────────────────────────┘
          ↙         ↓         ↘
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  WEB WRAPPER  │ │    CHROME     │ │  MINIPROGRAM  │
│  (thin layer) │ │   EXTENSION   │ │    WRAPPER    │
└───────────────┘ └───────────────┘ └───────────────┘
```

### What's Shared (Core)
- All calendar calculations (lunar/gregorian conversions)
- Holiday lookups (春节, 中秋节, etc.)
- 节气 (Solar Terms) lookups
- Month/year name formatting
- Huangdi Era year calculations
- Leap month handling
- Data structures and business rules

### What's Platform-Specific (Wrappers)
| Aspect | Web | Mini Program |
|--------|-----|--------------|
| Entry | `index.html` | `app.js/json` |
| Templates | HTML | WXML |
| Styles | CSS | WXSS (rpx units) |
| Rendering | DOM manipulation | Component system |
| Events | addEventListener | bindtap/bindchange |
| Selectors | `<select>` | `<picker>` |

### Module System
- **Web (core/)**: ES6 modules with `export`/`import`
- **Mini Program (miniprogram/core/)**: CommonJS with `module.exports`/`require`

## Project Roadmap

### v0.1 (Current)
- Web app with full calendar features
- WeChat mini program support

### Future Plans
- Chrome extension
- Additional mini program platforms (Alipay, etc.)
