# Shutdown Timer 🕐

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0+-FFC131.svg)](https://tauri.app/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, customizable desktop shutdown timer with extensive theming capabilities. Schedule system shutdowns with countdown or scheduled timing, complete with visual customization, multilingual support, and professional UI/UX.

> ✨ **Recently Overhauled**: Transformed from a cramped vertical layout to a modern sidebar-based application with full visual customization capabilities.

## ✨ Features

### 🎯 Core Timer Functionality
- **Countdown Mode**: Set hours/minutes/seconds until shutdown
- **Schedule Mode**: Schedule shutdown at specific time of day
- **Ringtone Support**: Custom audio alerts before shutdown
- **System Integration**: Prevent sleep, minimize to tray, auto-start
- **Safety Features**: Cancel anytime, warning notifications

### 🎨 Advanced Theming System
- **10+ Preset Themes**: Professional designs including:
  - Cyberpunk Rewrite (modern neon)
  - Fresh Rewrite (clean light)  
  - Ocean Blue, Forest Green, Sunset Orange
  - Elegant Purple, Midnight Dark, Solarized Light
  - Monochrome, Retro 80s
- **Full Customization**: Create and save unlimited custom themes
- **Real-time Preview**: See changes instantly as you customize
- **Export/Import**: Share themes via JSON files

### 🖌️ Visual Customization
- **Color System**: Adjust 12+ semantic color variables
- **Font Selection**: Choose from 50+ curated Google Fonts
- **Layout Controls**: Fine-tune spacing, border radius, shadows
- **Background Images**: Upload custom backgrounds with opacity control
- **Typography**: Separate font selection for headings, body, mono, and accents

### 🌐 Internationalization
- **Three Languages**: Chinese (简体中文), English, Japanese (日本語)
- **Dynamic Switching**: Change language without restarting
- **Complete UI Coverage**: All interface elements translated

### 🧭 Modern UI/UX
- **Sidebar Navigation**: Organized 3-page layout (Timer, Settings, Appearance)
- **Smooth Animations**: Subtle fade/slide transitions between pages
- **Responsive Design**: Desktop-optimized with mobile considerations
- **Accessibility**: WCAG compliant, keyboard navigation, screen reader support

## 📸 Screenshots

### Timer Page
```
┌─────────────────────────────────────────────┐
│  ⚙️ Shutdown Timer                     [─][□][×]│
├───────┬─────────────────────────────────────┤
│       │                                     │
│       │         00 : 05 : 00                │
│       │                                     │
│       │     [⏱ Countdown] [📅 Schedule]     │
│       │                                     │
│ Timer │ ┌─────────────────────────────────┐ │
│       │ │ Status: Idle                    │ │
│       │ │ Mode: Countdown                 │ │
│       │ │ Ringtone: alarm.wav             │ │
│       │ └─────────────────────────────────┘ │
│       │                                     │
│Settings│  ┌──┐ : ┌──┐ : ┌──┐               │
│       │  │00│   │05│   │00│               │
│       │  └──┘   └──┘   └──┘               │
│       │                                     │
│Appear-│  ┌─────────────────────────┐ [▶]   │
│  ance │  │ Select ringtone file... │       │
│       │  └─────────────────────────┘       │
│       │                                     │
│       │  ┌───────────────────────────────┐ │
│       │  │      ▶ Start Countdown ◀      │ │
│       │  └───────────────────────────────┘ │
│       │                                     │
│       │  [✓] Prevent Sleep  [✓] Min to Tray │
│       │                                     │
└───────┴─────────────────────────────────────┘
```

### Appearance Customization
- **Colors Tab**: Adjust all theme colors with live preview
- **Fonts Tab**: Browse 50+ fonts with search and categories
- **Layout Tab**: Fine-tune spacing, borders, and shadows
- **Background Tab**: Upload images with opacity controls
- **Themes Tab**: Browse presets and manage custom themes

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ and npm
- [Rust](https://www.rust-lang.org/) (for Tauri backend)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd shutdown-timer

# Install frontend dependencies
cd src
npm install

# Install Tauri dependencies
cd ../src-tauri
cargo build
```

### Development
```bash
# From the src directory
npm run dev

# Or from project root with Tauri
npm run tauri dev
```

### Building
```bash
# Development build
npm run build

# Production build (Tauri)
npm run tauri build
```

## 📖 Usage Guide

### Setting a Timer
1. **Open the application**
2. **Select Timer page** from sidebar
3. **Choose mode**:
   - **Countdown**: Enter hours/minutes/seconds
   - **Schedule**: Enter specific time (24-hour format)
4. **Optional**: Select ringtone file for warning alert
5. **Adjust settings**:
   - Prevent sleep during countdown
   - Minimize to system tray
   - Enable auto-start on system boot
6. **Click "Start Countdown"** or "Set Schedule"

### Customizing Appearance
1. **Navigate to Appearance page** from sidebar
2. **Explore tabs**:
   - **Colors**: Adjust all theme colors
   - **Fonts**: Select font families for different text types
   - **Layout**: Fine-tune spacing, borders, shadows
   - **Background**: Upload and adjust background images
   - **Themes**: Browse presets and manage custom themes
3. **Save custom themes** for later use
4. **Export/import themes** to share with others

### Managing Settings
1. **Navigate to Settings page** from sidebar
2. **Change language** between Chinese, English, or Japanese
3. **Adjust system preferences**
4. **Theme toggle** in sidebar footer for quick switching

## 🎨 Theme System

### Preset Themes
The application includes 10 professionally designed themes:

| Theme | Description | Category |
|-------|-------------|----------|
| **Fresh Rewrite** | Clean, light theme with soft green accents | Light |
| **Cyberpunk Rewrite** | Futuristic dark theme with neon cyan/magenta | Dark/Neon |
| **Ocean Blue** | Calm aquatic color scheme | Professional |
| **Forest Green** | Natural, earthy tones | Nature |
| **Sunset Orange** | Warm, sunset-inspired palette | Warm |
| **Elegant Purple** | Sophisticated, regal purple theme | Elegant |
| **Midnight Dark** | Pure dark mode with accent colors | Dark |
| **Solarized Light** | Professional, readability-optimized | Light/Professional |
| **Monochrome** | Grayscale with single accent color | Minimal |
| **Retro 80s** | Vibrant, nostalgic color scheme | Retro |

### Creating Custom Themes
1. **Start from a preset** or current customization
2. **Adjust colors**, fonts, and layout to your preference
3. **Click "Save Theme"** in the Themes tab
4. **Name your theme** and add optional description
5. **Export as JSON** to share with others

### Theme File Format
Custom themes are saved as JSON files with the following structure:
```json
{
  "id": "custom-theme-id",
  "name": "My Custom Theme",
  "description": "A personalized theme",
  "category": "Custom",
  "version": "1.0.0",
  "created": "2024-01-01T00:00:00.000Z",
  "colors": {
    "bgPrimary": "#ffffff",
    "textPrimary": "#000000",
    "accentPrimary": "#007acc"
  },
  "fonts": {
    "heading": "Inter, sans-serif",
    "body": "Inter, sans-serif"
  },
  "layout": {
    "spacing": "normal",
    "borderRadius": "md"
  }
}
```

## 🏗️ Technical Architecture

### Frontend Stack
- **TypeScript**: Type-safe JavaScript with modern features
- **Tailwind CSS v4**: Utility-first CSS framework with JIT compilation
- **Vite**: Fast build tool and development server
- **React 18**: For Appearance page components (lazy-loaded)
- **CSS Custom Properties**: Dynamic theming system

### Backend Stack
- **Tauri 2**: Secure, lightweight desktop application framework
- **Rust**: Systems programming for native performance
- **Windows API**: System integration for shutdown, tray, notifications

### Project Structure
```
shutdown-timer/
├── src/                    # Frontend source code
│   ├── components/        # Reusable UI components
│   │   ├── ColorPicker.tsx
│   │   ├── FontSelector.tsx
│   │   ├── Sidebar.ts
│   │   └── ...
│   ├── pages/            # Main application pages
│   │   ├── TimerPage     # Original timer functionality
│   │   ├── SettingsPage  # Language and preferences
│   │   └── AppearancePage # Visual customization
│   ├── types/            # TypeScript type definitions
│   ├── data/             # Static data (fonts, themes)
│   ├── utils/            # Utility functions
│   ├── __tests__/        # Test suite
│   ├── app.ts            # Main application logic
│   ├── i18n.ts           # Internationalization
│   ├── styles.css        # Tailwind + CSS variables
│   └── index.html        # Application shell
├── src-tauri/            # Tauri backend
│   ├── src/             # Rust source code
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri configuration
└── readme.md            # This file
```

### CSS Architecture
The application uses a systematic CSS variable naming convention:

```css
/* Color variables */
--color-bg-primary, --color-bg-secondary, --color-bg-tertiary
--color-text-primary, --color-text-secondary, --color-text-tertiary
--color-accent-primary, --color-accent-secondary
--color-status-success, --color-status-warning, --color-status-error

/* Typography variables */
--font-family-heading, --font-family-body, --font-family-mono
--font-size-base, --font-weight-normal, --font-weight-bold

/* Layout variables */
--spacing-unit, --border-radius, --shadow-intensity
```

## 🛠️ Development Guide

### Setting Up Development Environment
```bash
# 1. Install Node.js and npm
# 2. Install Rust and Cargo
# 3. Install Tauri CLI
cargo install tauri-cli

# 4. Clone and install dependencies
cd src
npm install
```

### Running Tests
```bash
# From src directory
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Code Quality
- **TypeScript**: Strict mode enabled, no implicit any
- **ESLint**: Code style and best practices
- **Prettier**: Consistent code formatting
- **Vitest**: Comprehensive test coverage

### Adding New Themes
1. **Edit `src/data/preset-themes.ts`**
2. **Add new theme object** following the `PresetTheme` interface
3. **Define color palette**, typography, and layout
4. **Test theme** with different content types
5. **Ensure accessibility** (WCAG contrast compliance)

### Adding New Fonts
1. **Edit `src/data/fonts.ts`**
2. **Add font object** with name, category, and weights
3. **Update FontSelector component** if adding new category
4. **Test font loading** and rendering

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs** by opening an issue
2. **Suggest features** or improvements
3. **Submit pull requests** with fixes or enhancements
4. **Improve documentation** or translations

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tauri Team** for the excellent desktop application framework
- **Tailwind CSS** for the utility-first CSS framework
- **Google Fonts** for the extensive font library
- **UI/UX Pro Max** guidelines for professional design standards
- **All contributors** who have helped improve this project

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/shutdown-timer/issues)
- **Documentation**: This README and code comments
- **Community**: Discussions and pull requests

---

**Made with ❤️ for desktop automation enthusiasts**

*Last updated: April 2024 | Version: 0.1.0*