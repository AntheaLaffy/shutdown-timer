export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
  border: string;
  borderHover: string;
  borderFocus: string;
  primary: string;
  primarySoft: string;
  primaryDark: string;
  accent: string;
  accentSoft: string;
  warning: string;
  danger: string;
  success: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
}

export interface ThemeEffects {
  glowPrimary: string;
  glowAccent: string;
  glowDanger: string;
  shadowCard: string;
  shadowHover: string;
  shadowInput: string;
}

export interface ThemeFonts {
  display: string;
  heading: string;
  body: string;
  mono: string;
}

export interface ThemeLayout {
  borderRadius: string;
  spacing: string;
}

export interface PresetTheme {
  id: string;
  name: string;
  description: string;
  category: 'light' | 'dark' | 'colorful' | 'nature' | 'professional' | 'minimal' | 'retro';
  colors: ThemeColors;
  effects?: ThemeEffects;
  fonts?: ThemeFonts;
  layout?: ThemeLayout;
}

export function applyTheme(theme: PresetTheme): void {
  const root = document.documentElement;

  root.setAttribute('data-theme', theme.id);

  const colors = theme.colors;
  root.style.setProperty('--color-bg-primary', colors.bgPrimary);
  root.style.setProperty('--color-bg-secondary', colors.bgSecondary);
  root.style.setProperty('--color-bg-tertiary', colors.bgTertiary);
  root.style.setProperty('--color-bg-elevated', colors.bgElevated);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-border-hover', colors.borderHover);
  root.style.setProperty('--color-border-focus', colors.borderFocus);
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-soft', colors.primarySoft);
  root.style.setProperty('--color-primary-dark', colors.primaryDark);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-soft', colors.accentSoft);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-danger', colors.danger);
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-text-primary', colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-text-tertiary', colors.textTertiary);
  root.style.setProperty('--color-text-inverse', colors.textInverse);

  if (theme.effects) {
    root.style.setProperty('--glow-primary', theme.effects.glowPrimary);
    root.style.setProperty('--glow-accent', theme.effects.glowAccent);
    root.style.setProperty('--glow-danger', theme.effects.glowDanger);
    root.style.setProperty('--shadow-card', theme.effects.shadowCard);
    root.style.setProperty('--shadow-hover', theme.effects.shadowHover);
    root.style.setProperty('--shadow-input', theme.effects.shadowInput);
  }

  if (theme.fonts) {
    root.style.setProperty('--font-display', theme.fonts.display);
    root.style.setProperty('--font-heading', theme.fonts.heading);
    root.style.setProperty('--font-body', theme.fonts.body);
    root.style.setProperty('--font-mono', theme.fonts.mono);
  }

  localStorage.setItem('theme', theme.id);
}

export function getStoredThemeId(): string | null {
  return localStorage.getItem('theme');
}