# Windows 关机定时器 — 多主题 + 多语言 UI 设计规范

## 功能概述

| 功能 | 选项 |
|------|------|
| **主题** | 10 种预设主题（可切换） |
| **语言** | 简体中文 ↔ English ↔ 日本語 |
| **布局** | 侧边栏导航（Timer / Settings / Appearance） |

---

## 主题系统概述

支持 **10 种预设主题**，用户可通过 Appearance 页面管理并切换：

| 主题 | 风格 | 分类 |
|------|------|------|
| **Fresh** | 清新可爱，薄荷绿 | light |
| **Cyberpunk** | 赛博朋克，霓虹 | dark |
| **Ocean Blue** | 海洋蓝，宁静 | colorful |
| **Forest Green** | 森林绿，自然 | nature |
| **Sunset Orange** | 日落橙，温暖 | colorful |
| **Elegant Purple** | 优雅紫，奢华 | professional |
| **Midnight Dark** | 午夜黑，纯粹暗色 | dark |
| **Solarized Light** | 太阳化，专注阅读 | light |
| **Monochrome** | 单色灰，极简 | minimal |
| **Retro 80s** | 复古80年代，霓虹 | retro |

---

## 主题变量系统

所有主题通过 CSS 变量定义，支持动态切换：

```css
/* 背景色 */
--color-bg-primary    /* 主背景 */
--color-bg-secondary  /* 卡片背景 */
--color-bg-tertiary   /* 输入框背景 */
--color-bg-hover      /* 悬停背景 */

/* 边框色 */
--color-border
--color-border-hover
--color-border-focus

/* 主色调 */
--color-primary
--color-primary-soft
--color-primary-dark

/* 强调色 */
--color-accent
--color-accent-soft

/* 状态色 */
--color-warning
--color-danger
--color-success

/* 文字色 */
--color-text-primary
--color-text-secondary
--color-text-tertiary
--color-text-inverse

/* 特效 */
--effect-glow          /* 发光效果 */
--effect-card-shadow   /* 卡片阴影 */
--effect-input-shadow  /* 输入框阴影 */
```

---

## 布局结构

```
┌──────────────────────────────────────────────────┐
│  ┌──────────┐  ┌─────────────────────────────┐  │
│  │          │  │  Timer Page / Settings /    │  │
│  │  Sidebar │  │  Appearance Page            │  │
│  │          │  │                             │  │
│  │  ⏱ Timer │  │  ┌─────────────────────┐  │  │
│  │  ⚙ Settings│ │  │  HH : MM : SS     │  │  │
│  │  🎨 Appearance│ │  └─────────────────────┘  │  │
│  │          │  │                             │  │
│  │  ─────── │  │  [倒计时] [定时]            │  │
│  │  Theme   │  │                             │  │
│  │  Toggle  │  │  状态面板 / 设置项 / 主题   │  │
│  └──────────┘  └─────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 页面说明

1. **Timer Page** — 倒计时/定时设置与控制
2. **Settings Page** — 语言、系统偏好设置
3. **Appearance Page** — 主题管理（颜色、字体、布局、背景）

---

## 主题一：Cyberpunk — "NEON TERMINAL"

**风格**: 赛博朋克 + 终端黑客风
**定位**: 极客/科技爱好者专属
**关键词**: 霓虹、Glitch、扫描线、终端、科幻

### Color Palette
```css
:root[data-theme="cyberpunk"] {
  /* 背景层次 */
  --color-bg-primary:    #05050a;      /* 深邃黑紫 */
  --color-bg-secondary: #0d0d15;      /* 面板背景 */
  --color-bg-tertiary:  #14141f;      /* 卡片背景 */
  --color-bg-elevated:  #1a1a28;      /* 悬浮元素 */

  /* 霓虹边框 */
  --color-border:        #00f0ff;      /* 青色霓虹 */
  --color-border-hover:  #ff00aa;     /* 品红霓虹 */
  --color-border-focus:  #00f0ff;      /* 聚焦边框 */

  /* 主色调 */
  --color-primary:       #00f0ff;      /* 青色 */
  --color-primary-soft:  rgba(0, 240, 255, 0.08);
  --color-accent:       #ff00aa;      /* 品红 */

  /* 状态色 */
  --color-warning:       #f0ff00;      /* 黄色警告 */
  --color-danger:        #ff2d6a;      /* 红色危险 */
  --color-success:       #00ff88;      /* 绿色成功 */

  /* 文字色 */
  --color-text-primary:  #e0e0ff;      /* 主文字 */
  --color-text-secondary:#7a7a9a;     /* 次文字 */
  --color-text-muted:    #4a4a6a;     /* 弱化文字 */

  /* 发光特效 */
  --glow-primary: 0 0 5px #00f0ff, 0 0 10px #00f0ff, 0 0 20px #00f0ff, 0 0 40px #00f0ff;
  --glow-accent:  0 0 5px #ff00aa, 0 0 10px #ff00aa, 0 0 20px #ff00aa;
  --glow-danger:  0 0 5px #ff2d6a, 0 0 15px #ff2d6a;
}
```

### Typography — Cyberpunk
- **Display**: `Orbitron` — 几何感数字
- **Heading**: `Rajdhani` — 科幻感标题
- **Body**: `Rajdhani` — 科技感正文
- **Mono**: `Share Tech Mono` — 终端文字

### Visual Effects

#### 1. 扫描线动画
```css
.cyberpunk-scanlines::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    rgba(0, 240, 255, 0.03) 1px,
    transparent 2px
  );
  pointer-events: none;
  animation: scanline-move 8s linear infinite;
}
```

#### 2. 霓虹发光文字
```css
.neon-text {
  color: #00f0ff;
  text-shadow: var(--glow-primary);
  animation: neon-flicker 4s ease-in-out infinite;
}

@keyframes neon-flicker {
  0%, 100% { opacity: 1; }
  92%, 94%, 97% { opacity: 0.8-0.9; }
}
```

#### 3. RGB Glitch 效果
```css
.glitch-text {
  position: relative;
  animation: glitch-skew 4s infinite linear alternate-reverse;
}

.glitch-text::before {
  content: attr(data-text);
  position: absolute;
  color: #ff00aa;
  animation: glitch-1 0.5s infinite linear alternate-reverse;
  clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
}

.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  color: #00f0ff;
  animation: glitch-2 0.5s infinite linear alternate-reverse;
  clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
}
```

#### 4. 边框脉冲呼吸灯
```css
.pulse-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #00f0ff, #ff00aa, #00f0ff);
  background-size: 300% 300%;
  z-index: -1;
  animation: border-glow 3s ease infinite;
  opacity: 0.6;
}
```

### UI 组件样式

#### 按钮
```css
.btn-cyberpunk {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-primary);
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  transition: all 0.2s ease;
}

.btn-cyberpunk:hover {
  color: #000;
  box-shadow: var(--glow-primary);
}

.btn-cyberpunk:hover::before { opacity: 1; }
.btn-cyberpunk::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-primary);
  opacity: 0;
  transition: opacity 0.2s;
}
```

#### 输入框
```css
.input-cyberpunk {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  color: var(--color-primary);
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.2rem;
  padding: 12px 16px;
}

.input-cyberpunk:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3), inset 0 0 10px rgba(0, 240, 255, 0.1);
}
```

#### 卡片
```css
.card-cyberpunk {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  clip-path: polygon(0 12px, 12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%);
}

.card-cyberpunk::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 20px; height: 20px;
  border-top: 2px solid var(--color-primary);
  border-left: 2px solid var(--color-primary);
}

.card-cyberpunk::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0;
  width: 20px; height: 20px;
  border-bottom: 2px solid var(--color-accent);
  border-right: 2px solid var(--color-accent);
}
```

---

## 主题二：Fresh — "MINT GARDEN"

**风格**: 清新自然 + 圆润可爱
**定位**: 日常友好、通勤必备
**关键词**: 薄荷绿、柔和、自然、有机形态

### Color Palette
```css
:root[data-theme="fresh"] {
  /* 背景层次 */
  --color-bg-primary:    #f0f7f4;      /* 薄荷白 */
  --color-bg-secondary:  #ffffff;      /* 纯白卡片 */
  --color-bg-tertiary:   #e8f5ee;      /* 淡绿背景 */
  --color-bg-elevated:   #ffffff;      /* 悬浮元素 */

  /* 柔和边框 */
  --color-border:        #c8e6c9;      /* 薄荷绿边框 */
  --color-border-hover:  #81c784;      /* 悬停边框 */
  --color-border-focus:  #4caf50;      /* 聚焦边框 */

  /* 主色调 */
  --color-primary:       #4caf50;      /* 薄荷绿 */
  --color-primary-soft:  rgba(76, 175, 80, 0.12);
  --color-accent:        #ff7043;      /* 珊瑚橙 */

  /* 状态色 */
  --color-warning:       #ff9800;      /* 橙色警告 */
  --color-danger:        #ef5350;      /* 红色危险 */
  --color-success:       #66bb6a;      /* 绿色成功 */

  /* 文字色 */
  --color-text-primary:  #2e3e30;      /* 深绿文字 */
  --color-text-secondary:#5a7a58;      /* 次文字 */
  --color-text-muted:    #9aaa9a;      /* 弱化文字 */

  /* 柔和阴影 */
  --shadow-soft: 0 2px 8px rgba(76, 175, 80, 0.1), 0 4px 20px rgba(0, 0, 0, 0.05);
  --shadow-hover: 0 4px 12px rgba(76, 175, 80, 0.2), 0 8px 30px rgba(0, 0, 0, 0.08);
}
```

### Typography — Fresh
- **Display**: `Quicksand` — 圆润可爱数字
- **Heading**: `Nunito` — 柔和几何标题
- **Body**: `Nunito` — 易读柔和正文
- **Accent**: `Comfortaa` — 装饰标签

### Visual Effects

#### 1. 星星闪烁
```css
.fresh-stars::before {
  content: '✦ ✧ ✦ ✧ ✦';
  position: absolute;
  top: 10px; right: 15px;
  font-size: 8px;
  color: var(--color-primary);
  opacity: 0.4;
  letter-spacing: 4px;
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}
```

#### 2. 按钮弹跳效果
```css
.btn-fresh {
  background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
  border: none;
  color: white;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  border-radius: 50px;
  padding: 14px 32px;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-fresh:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-fresh:active {
  transform: translateY(0) scale(0.98);
}
```

#### 3. 卡片悬浮效果
```css
.card-fresh {
  background: var(--color-bg-secondary);
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.card-fresh:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}
```

#### 4. 输入框聚焦动画
```css
.input-fresh {
  background: var(--color-bg-tertiary);
  border: 2px solid transparent;
  border-radius: 12px;
  color: var(--color-text-primary);
  font-family: 'Nunito', sans-serif;
  font-size: 1.1rem;
  padding: 12px 18px;
  transition: all 0.25s ease;
}

.input-fresh:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-bg-secondary);
  box-shadow: 0 0 0 4px var(--color-primary-soft);
}
```

#### 5. 警报时卡片摇晃
```css
@keyframes card-shake {
  0%, 100% { transform: translateX(0) rotate(0); }
  10%, 30%, 50% { transform: translateX(-3px) rotate(-1deg); }
  20%, 40% { transform: translateX(3px) rotate(1deg); }
  60% { transform: translateX(-2px); }
  70% { transform: translateX(2px); }
}

.card-alert {
  animation: card-shake 0.6s ease-in-out;
}
```

### UI 组件样式

#### 时间显示
```css
.timer-display-fresh {
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 4.5rem;
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.timer-display-fresh .digit.bounce {
  animation: digit-bounce 0.3s ease;
}

@keyframes digit-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```

#### 侧边栏
```css
.sidebar-fresh {
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  padding: 24px 16px;
}

.sidebar-item-fresh {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  color: var(--color-text-secondary);
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.sidebar-item-fresh:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.sidebar-item-fresh.active {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}
```

---

## 语言切换

### 支持的语言
| Code | Language | Native Name |
|------|----------|-------------|
| `zh` | 简体中文 | 简体中文 |
| `en` | English | English |
| `ja` | 日本語 | 日本語 |

### 使用方式
```typescript
import { t, languages, type Lang } from './i18n';

// 获取翻译
const title = t('app.title', 'zh');  // '关机定时器'
const status = t('status.running', 'en');  // 'Running'

// 语言列表
languages.forEach(lang => {
  console.log(lang.code, lang.nativeName);
});
```

---

## 组件样式

### 时间显示
| 主题 | 样式 |
|------|------|
| Cyberpunk | Orbitron 数字 + 霓虹发光 |
| Fresh | Quicksand 数字 + 柔和阴影 |

### 按钮
| 主题 | 默认 | 悬停 |
|------|------|------|
| Cyberpunk | 斜角/切角 | Glitch hover |
| Fresh | 大圆角 | Bounce 弹性 |

### 输入框
| 主题 | 样式 |
|------|------|
| Cyberpunk | 直角，深色背景 |
| Fresh | 大圆角，浅色背景 |

---

## 动画效果

| 动画 | Cyberpunk | Fresh |
|------|-----------|-------|
| **Hover** | 霓虹发光增强 | 上浮 + 阴影加深 |
| **Active** | Glitch 闪烁 | Bounce 弹性 |
| **Alert** | RGB 分离抖动 | 卡片左右摇晃 |
| **Theme Switch** | Glitch 过渡 | 颜色渐变 |
| **Time Tick** | 数字闪烁 | 数字弹跳 |

---

## 技术实现

### 技术栈
- **HTML5** + **CSS3** (CSS Variables)
- **TypeScript**
- **Tailwind CSS v4**
- **React 18** (Appearance 页面)
- **Tauri v2**

### CSS 架构
```css
/* Tailwind v4 */
@import "tailwindcss";

/* 基础变量 */
:root {
  --transition-speed: 300ms;
}

/* 主题变量 */
:root[data-theme="fresh"] {
  --color-bg-primary: #f8faf8;
  --color-primary: #4caf50;
  /* ... */
}

:root[data-theme="cyberpunk"] {
  --color-bg-primary: #0a0a0f;
  --color-primary: #00f0ff;
  /* ... */
}

/* 所有元素共享过渡 */
* {
  transition: background-color var(--transition-speed),
              border-color var(--transition-speed),
              color var(--transition-speed),
              box-shadow var(--transition-speed);
}
```

### 主题切换
```typescript
import { applyTheme, presetThemes, type PresetTheme } from './types/theme';

// 应用预设主题
applyTheme('ocean-blue');

// 应用自定义主题
applyTheme(customTheme);
```

### 文件结构
```
src/
├── app.ts              # 主应用逻辑
├── i18n.ts             # 多语言翻译
├── styles.css          # Tailwind + 主题变量
├── index.html          # HTML 入口
├── components/
│   └── Sidebar.ts      # 侧边栏组件
├── pages/
│   └── AppearancePage.tsx  # 主题管理页面 (React)
├── types/
│   └── theme.ts        # 主题类型定义
└── data/
    └── preset-themes.ts   # 10 种预设主题
```

---

## 数据持久化

所有用户设置通过 `localStorage` 持久化存储。

### localStorage 键
| 键名 | 内容 |
|------|------|
| `shutdown-timer-settings` | 应用设置（时间、toggle 状态等） |
| `theme` | 当前主题 ID |
| `lang` | 当前语言代码 |
| `appearanceSettings` | 外观设置（颜色、字体等） |
| `customThemes` | 自定义主题 |

### `shutdown-timer-settings` 数据结构
```typescript
interface PersistentSettings {
  theme: 'fresh' | 'cyberpunk' | 'ocean-blue' | ...;  // 主题 ID
  lang: 'zh' | 'en' | 'ja';                           // 语言
  hours: number;                                       // 小时
  minutes: number;                                     // 分钟
  seconds: number;                                     // 秒数
  ringtonePath: string;                                // 铃声文件路径
  preventSleep: boolean;                               // 阻止休眠 toggle
  minToTray: boolean;                                  // 最小化到托盘 toggle
  autoStart: boolean;                                  // 开机自启 toggle
}
```

### 需要持久化的 Toggle 状态
| Toggle | 说明 | 默认值 |
|--------|------|--------|
| `preventSleepToggle` | 倒计时期间阻止系统休眠 | `true` |
| `minToTrayToggle` | 关闭按钮最小化到托盘 | `true` |
| `autoStartToggle` | 开机自动启动应用 | `false` |

---

## Tauri 命令接口

| 命令 | 说明 |
|------|------|
| `shutdown_now` | 立即关机 |
| `cancel_shutdown` | 取消定时关机 |
| `schedule_shutdown` | 定时关机 |
| `prevent_sleep` | 阻止休眠 |
| `allow_sleep` | 允许休眠 |
| `play_ringtone` | 播放铃声 |
| `stop_ringtone` | 停止铃声 |
| `enable_auto_start` | 启用开机自启 |
| `disable_auto_start` | 禁用开机自启 |
| `is_auto_start_enabled` | 检查开机自启状态 |
