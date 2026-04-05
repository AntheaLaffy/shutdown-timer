import { convertFileSrc } from '@tauri-apps/api/core';

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
  shadowIntensity?: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  version?: string;
  created?: string;
  colors: ThemeColors;
  effects?: ThemeEffects;
  fonts?: ThemeFonts;
  layout?: ThemeLayout;
}

export type PresetTheme = ThemeDefinition;

export interface BackgroundAppearance {
  imagePath: string;
  opacity: number;
}

const defaultEffects: ThemeEffects = {
  glowPrimary: '0 0 5px rgba(76, 175, 80, 0.5)',
  glowAccent: '0 0 5px rgba(255, 112, 67, 0.5)',
  glowDanger: '0 0 5px rgba(239, 83, 80, 0.5)',
  shadowCard: '0 2px 8px rgba(76, 175, 80, 0.1), 0 4px 20px rgba(0, 0, 0, 0.05)',
  shadowHover: '0 4px 12px rgba(76, 175, 80, 0.2), 0 8px 30px rgba(0, 0, 0, 0.08)',
  shadowInput: '0 0 0 4px rgba(76, 175, 80, 0.12)',
};

const defaultFonts: ThemeFonts = {
  display: 'Quicksand',
  heading: 'Nunito',
  body: 'Nunito',
  mono: 'JetBrains Mono',
};

const defaultLayout: ThemeLayout = {
  borderRadius: '12px',
  spacing: 'normal',
  shadowIntensity: 'normal',
};

function spacingScale(spacing: string): string {
  switch (spacing) {
    case 'compact':
      return '0.86';
    case 'relaxed':
      return '1.14';
    case 'spacious':
      return '1.3';
    default:
      return '1';
  }
}

function shadowStrength(scale: string): string {
  switch (scale) {
    case 'soft':
      return '0.75';
    case 'strong':
      return '1.35';
    default:
      return '1';
  }
}

function fontHref(fontName: string): string | null {
  const cleaned = fontName.split(',')[0].replace(/["']/g, '').trim();
  if (!cleaned || /mono|serif|sans-serif|system-ui/i.test(cleaned)) {
    return null;
  }

  const family = cleaned.replace(/\s+/g, '+');
  return `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap`;
}

function ensureFontLoaded(fontName: string): void {
  const href = fontHref(fontName);
  if (!href) return;

  const id = `font-${href}`;
  if (document.getElementById(id)) return;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export function normalizeTheme(theme: Partial<ThemeDefinition>, fallback?: ThemeDefinition): ThemeDefinition {
  if (!fallback && !theme.colors) {
    throw new Error('Theme colors are required');
  }

  return {
    id: theme.id ?? fallback?.id ?? 'custom-theme',
    name: theme.name ?? fallback?.name ?? 'Custom Theme',
    description: theme.description ?? fallback?.description ?? '',
    category: theme.category ?? fallback?.category ?? 'custom',
    version: theme.version ?? fallback?.version ?? '1.0.0',
    created: theme.created ?? fallback?.created ?? new Date().toISOString(),
    colors: { ...fallback?.colors, ...theme.colors } as ThemeColors,
    effects: { ...defaultEffects, ...fallback?.effects, ...theme.effects },
    fonts: { ...defaultFonts, ...fallback?.fonts, ...theme.fonts },
    layout: { ...defaultLayout, ...fallback?.layout, ...theme.layout },
  };
}

export function themeFromJson(value: unknown, fallback?: ThemeDefinition): ThemeDefinition | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<ThemeDefinition>;
  if (!candidate.colors && !fallback) return null;

  try {
    return normalizeTheme(candidate, fallback);
  } catch {
    return null;
  }
}

export function isThemeValue(value: unknown): value is ThemeDefinition {
  return !!themeFromJson(value);
}

export function applyTheme(theme: ThemeDefinition, background?: BackgroundAppearance): void {
  const root = document.documentElement;
  const normalized = normalizeTheme(theme);
  const layout = normalized.layout ?? defaultLayout;
  const fonts = normalized.fonts ?? defaultFonts;
  const effects = normalized.effects ?? defaultEffects;
  const colors = normalized.colors;

  root.setAttribute('data-theme', normalized.id);

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

  root.style.setProperty('--glow-primary', effects.glowPrimary);
  root.style.setProperty('--glow-accent', effects.glowAccent);
  root.style.setProperty('--glow-danger', effects.glowDanger);
  root.style.setProperty('--shadow-card', effects.shadowCard);
  root.style.setProperty('--shadow-hover', effects.shadowHover);
  root.style.setProperty('--shadow-input', effects.shadowInput);

  ensureFontLoaded(fonts.display);
  ensureFontLoaded(fonts.heading);
  ensureFontLoaded(fonts.body);
  ensureFontLoaded(fonts.mono);

  root.style.setProperty('--font-display', `"${fonts.display}", sans-serif`);
  root.style.setProperty('--font-heading', `"${fonts.heading}", sans-serif`);
  root.style.setProperty('--font-body', `"${fonts.body}", sans-serif`);
  root.style.setProperty('--font-mono', `"${fonts.mono}", monospace`);

  root.style.setProperty('--border-radius', layout.borderRadius);
  root.style.setProperty('--spacing-scale', spacingScale(layout.spacing));
  root.style.setProperty('--shadow-strength', shadowStrength(layout.shadowIntensity ?? 'normal'));

  if (background?.imagePath) {
    root.style.setProperty('--app-background-image', `url("${convertFileSrc(background.imagePath)}")`);
    root.style.setProperty('--app-background-opacity', String(background.opacity));
  } else {
    root.style.setProperty('--app-background-image', 'none');
    root.style.setProperty('--app-background-opacity', '0');
  }
}
