# 关机定时器 🕐

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0+-FFC131.svg)](https://tauri.app/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

一个现代化、可定制的桌面关机定时器，支持倒计时/定时关机、丰富的主题系统、多语言切换和专业级 UI/UX 设计。

> ✨ **全新改版**：从紧凑的竖版布局升级为现代化的侧边栏应用，支持完整的视觉定制功能。

## ✨ 功能特点

### 🎯 核心定时功能
- **倒计时模式**：设置时/分/秒后关机
- **定时模式**：设置具体时间点关机
- **铃声提醒**：关机前播放自定义音频警报
- **系统集成**：阻止休眠、最小化到托盘、开机自启
- **安全功能**：随时取消、警告通知

### 🎨 高级主题系统
- **10+ 预设主题**：专业设计方案，包括：
  - Cyberpunk（赛博朋克霓虹风）
  - Fresh（清新薄荷绿）
  - Ocean Blue（海洋蓝）
  - Forest Green（森林绿）
  - Sunset Orange（日落橙）
  - Elegant Purple（优雅紫）
  - Midnight Dark（午夜黑）
  - Solarized Light（太阳化亮色）
  - Monochrome（单色灰）
  - Retro 80s（复古80年代）
- **完整自定义**：创建并保存无限数量的自定义主题
- **实时预览**：自定义时即时查看效果
- **导入/导出**：通过 JSON 文件分享主题

### 🖌️ 视觉自定义
- **色彩系统**：调整 12+ 个语义化颜色变量
- **字体选择**：从 50+ 款精选 Google Fonts 中选择
- **布局控制**：精细调整间距、圆角、阴影
- **背景图片**：上传自定义背景并控制透明度
- **版式设计**：分别为标题、正文、等宽字体、装饰元素选择字体

### 🌐 国际化
- **三种语言**：简体中文、英语、日语
- **动态切换**：无需重启即可切换语言
- **完整覆盖**：所有界面元素均已翻译

### 🧭 现代 UI/UX
- **侧边栏导航**：三页面布局（定时器、设置、外观）
- **流畅动画**：页面切换时的淡入/滑动过渡效果
- **响应式设计**：桌面优化，兼顾移动端体验
- **无障碍支持**：WCAG 规范兼容、键盘导航、屏幕阅读器支持

## 📸 界面预览

### 定时器页面
```
┌─────────────────────────────────────────────┐
│  ⚙️ 关机定时器                          [─][□][×]│
├───────┬─────────────────────────────────────┤
│       │                                     │
│       │           00 : 05 : 00             │
│       │                                     │
│       │    [⏱ 倒计时]    [📅 定时]          │
│       │                                     │
│ 定时器 │  ┌─────────────────────────────┐  │
│       │  │ 状态: 空闲                    │  │
│       │  │ 模式: 倒计时                 │  │
│       │  │ 铃声: alarm.wav              │  │
│       │  └─────────────────────────────┘  │
│ 设置   │                                     │
│       │   ┌──┐ : ┌──┐ : ┌──┐              │
│       │   │00│   │05│   │00│              │
│       │   └──┘   └──┘   └──┘              │
│       │                                     │
│ 外观   │   ┌─────────────────────────┐ [▶]  │
│       │   │ 选择铃声文件...          │      │
│       │   └─────────────────────────┘       │
│       │                                     │
│       │   ┌───────────────────────────────┐ │
│       │   │       ▶ 开始倒计时 ◀          │ │
│       │   └───────────────────────────────┘ │
│       │                                     │
│       │   [✓] 阻止休眠   [✓] 最小化到托盘   │
│       │                                     │
└───────┴─────────────────────────────────────┘
```

### 外观定制页面
- **颜色选项卡**：调整所有主题颜色，实时预览
- **字体选项卡**：浏览 50+ 字体，支持搜索和分类
- **布局选项卡**：精细调整间距、边框、阴影
- **背景选项卡**：上传图片并调整透明度
- **主题选项卡**：浏览预设主题和管理自定义主题

## 🚀 快速开始

### 环境要求
- [Node.js](https://nodejs.org/) 18+ 和 npm
- [Rust](https://www.rust-lang.org/)（用于 Tauri 后端）
- [Tauri CLI](https://tauri.app/v2/guides/getting-started/prerequisites)

### 安装步骤
```bash
# 克隆仓库
git clone <仓库地址>
cd shutdown-timer

# 安装前端依赖
cd src
npm install

# 安装 Tauri 依赖
cd ../src-tauri
cargo build
```

### 开发模式
```bash
# 在 src 目录运行
npm run dev

# 或在项目根目录运行 Tauri 开发模式
npm run tauri dev
```

### 构建发布版
```bash
# 前端构建
npm run build

# Tauri 发布构建
npm run tauri build
```

## 📖 使用指南

### 设置定时器
1. **打开应用程序**
2. **从侧边栏选择"定时器"页面**
3. **选择模式**：
   - **倒计时**：输入时/分/秒
   - **定时**：输入具体时间（24小时制）
4. **可选**：选择铃声文件作为警报提醒
5. **调整设置**：
   - 倒计时期间阻止系统休眠
   - 最小化到系统托盘
   - 开机自动启动
6. **点击"开始倒计时"或"设置定时"**

### 自定义外观
1. **从侧边栏进入"外观"页面**
2. **探索各选项卡**：
   - **颜色**：调整所有主题颜色
   - **字体**：为不同文本类型选择字体
   - **布局**：精细调整间距、边框、阴影
   - **背景**：上传并调整背景图片
   - **主题**：浏览预设和管理自定义主题
3. **保存自定义主题**供以后使用
4. **导入/导出主题**与他人分享

### 管理设置
1. **从侧边栏进入"设置"页面**
2. **在中文、英语、日语之间切换语言**
3. **调整系统偏好设置**
4. **使用侧边栏底部的快速切换按钮**快速切换主题

## 🎨 主题系统

### 预设主题
应用内置 10 款专业设计主题：

| 主题 | 描述 | 分类 |
|-------|------|------|
| **Fresh** | 清新薄荷绿，柔和绿色点缀 | 亮色 |
| **Cyberpunk** | 未来感暗色主题，青色/品红霓虹 | 暗色/霓虹 |
| **Ocean Blue** | 平静的海洋色调 | 专业 |
| **Forest Green** | 自然大地的色调 | 自然 |
| **Sunset Orange** | 温暖的日落配色 | 暖色 |
| **Elegant Purple** | 高贵典雅的紫色主题 | 优雅 |
| **Midnight Dark** | 纯暗色模式配点缀色 | 暗色 |
| **Solarized Light** | 专业级可读性优化 | 亮色/专业 |
| **Monochrome** | 灰度单色配单一强调色 | 极简 |
| **Retro 80s** | 充满活力的复古配色 | 复古 |

### 创建自定义主题
1. **从预设主题开始**或基于当前自定义
2. **调整颜色、字体和布局**至你满意
3. **点击主题选项卡中的"保存主题"**
4. **为你的主题命名**并添加可选描述
5. **导出为 JSON** 与他人分享

### 主题文件格式
自定义主题保存为 JSON 文件，结构如下：
```json
{
  "id": "custom-theme-id",
  "name": "我的自定义主题",
  "description": "一个个性化主题",
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

## 🏗️ 技术架构

### 前端技术栈
- **TypeScript**：现代类型安全的 JavaScript
- **Tailwind CSS v4**：JIT 编译的实用优先 CSS 框架
- **Vite**：快速构建工具和开发服务器
- **React 18**：外观页面组件（懒加载）
- **CSS 自定义属性**：动态主题系统

### 后端技术栈
- **Tauri 2**：安全、轻量的桌面应用框架
- **Rust**：系统编程，实现原生性能
- **Windows API**：关机、托盘、通知等系统集成

### 项目结构
```
shutdown-timer/
├── src/                    # 前端源代码
│   ├── components/        # 可复用 UI 组件
│   │   ├── ColorPicker.tsx
│   │   ├── FontSelector.tsx
│   │   ├── Sidebar.ts
│   │   └── ...
│   ├── pages/            # 主应用页面
│   │   ├── TimerPage     # 原始定时器功能
│   │   ├── SettingsPage  # 语言和偏好设置
│   │   └── AppearancePage # 视觉定制
│   ├── types/            # TypeScript 类型定义
│   ├── data/             # 静态数据（字体、主题）
│   ├── utils/            # 工具函数
│   ├── __tests__/        # 测试套件
│   ├── app.ts            # 主应用逻辑
│   ├── i18n.ts           # 国际化
│   ├── styles.css        # Tailwind + CSS 变量
│   └── index.html        # 应用外壳
├── src-tauri/            # Tauri 后端
│   ├── src/             # Rust 源代码
│   ├── Cargo.toml       # Rust 依赖
│   └── tauri.conf.json  # Tauri 配置
└── README.md            # 本文件
```

### CSS 架构
应用采用系统化的 CSS 变量命名约定：

```css
/* 颜色变量 */
--color-bg-primary, --color-bg-secondary, --color-bg-tertiary
--color-text-primary, --color-text-secondary, --color-text-tertiary
--color-accent-primary, --color-accent-secondary
--color-status-success, --color-status-warning, --color-status-error

/* 排版变量 */
--font-family-heading, --font-family-body, --font-family-mono
--font-size-base, --font-weight-normal, --font-weight-bold

/* 布局变量 */
--spacing-unit, --border-radius, --shadow-intensity
```

## 🛠️ 开发指南

### 环境配置
```bash
# 1. 安装 Node.js 和 npm
# 2. 安装 Rust 和 Cargo
# 3. 安装 Tauri CLI
cargo install tauri-cli

# 4. 克隆并安装依赖
cd src
npm install
```

### 运行测试
```bash
# 在 src 目录运行
npm test

# 监听模式
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

### 代码质量
- **TypeScript**：严格模式启用，无隐式 any
- **ESLint**：代码风格和最佳实践
- **Prettier**：一致的代码格式化
- **Vitest**：全面的测试覆盖

### 添加新主题
1. **编辑 `src/data/preset-themes.ts`**
2. **按照 `PresetTheme` 接口添加新主题对象**
3. **定义调色板、字体和布局**
4. **用不同内容类型测试主题**
5. **确保无障碍访问**（WCAG 对比度合规）

### 添加新字体
1. **编辑 `src/data/fonts.ts`**
2. **添加字体对象**，包含名称、分类和字重
3. **如果添加新分类则更新 FontSelector 组件**
4. **测试字体加载和渲染**

## 🤝 贡献代码

欢迎贡献！以下是参与方式：

1. **提交问题** 报告 bug
2. **提出功能建议** 或改进意见
3. **提交 Pull Request** 修复或增强
4. **完善文档** 或翻译

### 开发流程
1. Fork 仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m 'Add amazing feature'`）
4. 推送分支（`git push origin feature/amazing-feature`）
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- **Tauri 团队** 提供优秀的桌面应用框架
- **Tailwind CSS** 提供实用优先的 CSS 框架
- **Google Fonts** 提供丰富的字体库
- **UI/UX Pro Max** 规范提供专业设计标准
- **所有贡献者** 帮助改进本项目

## 📞 支持

- **问题反馈**：[GitHub Issues](https://github.com/AntheaLaffy/shutdown-timer/issues)
- **文档资料**：本 README 和代码注释
- **社区交流**：Discussions 和 Pull Requests

---

**为桌面自动化爱好者用心打造** ❤️

*最后更新：2026年4月 | 版本：0.1.0*
