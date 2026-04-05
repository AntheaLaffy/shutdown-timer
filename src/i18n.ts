export type Lang = 'zh' | 'en' | 'ja';

export interface Language {
  code: Lang;
  name: string;
  nativeName: string;
}

export const languages: Language[] = [
  { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
];

type TranslationKey = keyof typeof translations.en;

const translations = {
  zh: {
    'app.title': '关机定时器',
    'nav.timer': '定时',
    'nav.settings': '设置',
    'nav.appearance': '外观',
    'timer.countdown': '倒计时',
    'timer.schedule': '定时',
    'timer.idle': '待机中',
    'timer.running': '运行中',
    'timer.hours': '时',
    'timer.minutes': '分',
    'timer.seconds': '秒',
    'timer.start': '开始倒计时',
    'timer.stop': '取消关机',
    'timer.setSchedule': '设置定时',
    'timer.status': '状态',
    'timer.mode': '模式',
    'timer.ringtone': '铃声',
    'timer.selectFile': '选择铃声文件',
    'timer.preventSleep': '阻止休眠',
    'timer.minToTray': '最小化到托盘',
    'settings.language': '语言',
    'settings.autoStart': '开机自启',
    'settings.enabled': '已启用',
    'settings.disabled': '已禁用',
    'appearance.themes': '主题',
    'appearance.colors': '颜色',
    'appearance.fonts': '字体',
    'appearance.layout': '布局',
    'appearance.background': '背景',
    'appearance.save': '保存主题',
    'appearance.export': '导出',
    'appearance.import': '导入',
  },
  en: {
    'app.title': 'Shutdown Timer',
    'nav.timer': 'Timer',
    'nav.settings': 'Settings',
    'nav.appearance': 'Appearance',
    'timer.countdown': 'Countdown',
    'timer.schedule': 'Schedule',
    'timer.idle': 'Idle',
    'timer.running': 'Running',
    'timer.hours': 'Hours',
    'timer.minutes': 'Minutes',
    'timer.seconds': 'Seconds',
    'timer.start': 'Start Countdown',
    'timer.stop': 'Cancel Shutdown',
    'timer.setSchedule': 'Set Schedule',
    'timer.status': 'Status',
    'timer.mode': 'Mode',
    'timer.ringtone': 'Ringtone',
    'timer.selectFile': 'Select ringtone file',
    'timer.preventSleep': 'Prevent Sleep',
    'timer.minToTray': 'Min to Tray',
    'settings.language': 'Language',
    'settings.autoStart': 'Auto Start',
    'settings.enabled': 'Enabled',
    'settings.disabled': 'Disabled',
    'appearance.themes': 'Themes',
    'appearance.colors': 'Colors',
    'appearance.fonts': 'Fonts',
    'appearance.layout': 'Layout',
    'appearance.background': 'Background',
    'appearance.save': 'Save Theme',
    'appearance.export': 'Export',
    'appearance.import': 'Import',
  },
  ja: {
    'app.title': 'シャットダウンタイマー',
    'nav.timer': 'タイマー',
    'nav.settings': '設定',
    'nav.appearance': '外観',
    'timer.countdown': 'カウントダウン',
    'timer.schedule': 'スケジュール',
    'timer.idle': '待機中',
    'timer.running': '実行中',
    'timer.hours': '時',
    'timer.minutes': '分',
    'timer.seconds': '秒',
    'timer.start': 'カウントダウン開始',
    'timer.stop': 'シャットダウン取消',
    'timer.setSchedule': 'スケジュール設定',
    'timer.status': '状態',
    'timer.mode': 'モード',
    'timer.ringtone': '着信音',
    'timer.selectFile': '着信音ファイルを選択',
    'timer.preventSleep': 'スリープ防止',
    'timer.minToTray': 'トレイに最小化',
    'settings.language': '言語',
    'settings.autoStart': '自動起動',
    'settings.enabled': '有効',
    'settings.disabled': '無効',
    'appearance.themes': 'テーマ',
    'appearance.colors': '色',
    'appearance.fonts': 'フォント',
    'appearance.layout': 'レイアウト',
    'appearance.background': '背景',
    'appearance.save': 'テーマ保存',
    'appearance.export': 'エクスポート',
    'appearance.import': 'インポート',
  },
};

export function t(key: TranslationKey, lang: Lang): string {
  return translations[lang][key] || translations.en[key] || key;
}

export function getStoredLang(): Lang {
  const stored = localStorage.getItem('lang');
  if (stored === 'zh' || stored === 'en' || stored === 'ja') {
    return stored;
  }
  return 'zh';
}

export function setStoredLang(lang: Lang): void {
  localStorage.setItem('lang', lang);
}