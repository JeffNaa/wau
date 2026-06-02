import { create } from 'zustand';

export interface SiteTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  radius: number;
}

export const defaultTheme: SiteTheme = {
  primary: '#171717',
  secondary: '#f5f5f5',
  accent: '#f5f5f5',
  background: '#ffffff',
  foreground: '#0a0a0a',
  radius: 0.5,
};

interface ThemeState {
  theme: SiteTheme;
  isLoading: boolean;
  setTheme: (theme: SiteTheme) => void;
  applyTheme: (theme: SiteTheme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: defaultTheme,
  isLoading: false,
  setTheme: (theme) => {
    set({ theme });
    applyThemeToDOM(theme);
  },
  applyTheme: (theme) => {
    set({ theme });
    applyThemeToDOM(theme);
  },
}));

const THEME_VARS = [
  '--primary', '--secondary', '--accent', '--background', '--foreground',
  '--card', '--card-foreground', '--popover', '--popover-foreground',
  '--primary-foreground', '--secondary-foreground', '--accent-foreground',
  '--muted', '--muted-foreground', '--border', '--input', '--ring', '--radius',
];

export function applyThemeToDOM(theme: SiteTheme) {
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--background', theme.background);
  root.style.setProperty('--foreground', theme.foreground);
  root.style.setProperty('--card', theme.background);
  root.style.setProperty('--card-foreground', theme.foreground);
  root.style.setProperty('--popover', theme.background);
  root.style.setProperty('--popover-foreground', theme.foreground);
  root.style.setProperty('--primary-foreground', getContrastColor(theme.primary));
  root.style.setProperty('--secondary-foreground', theme.foreground);
  root.style.setProperty('--accent-foreground', theme.foreground);
  root.style.setProperty('--muted', theme.secondary);
  root.style.setProperty('--muted-foreground', blendColors(theme.foreground, theme.background, 0.5));
  root.style.setProperty('--border', blendColors(theme.foreground, theme.background, 0.1));
  root.style.setProperty('--input', blendColors(theme.foreground, theme.background, 0.1));
  root.style.setProperty('--ring', theme.primary);
  root.style.setProperty('--radius', `${theme.radius}rem`);
}

export function clearThemeFromDOM() {
  const root = document.documentElement;
  for (const v of THEME_VARS) {
    root.style.removeProperty(v);
  }
}

const THEME_CACHE_KEY = 'wau_site_theme';

export function saveThemeToStorage(theme: SiteTheme) {
  try {
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(theme));
  } catch {}
}

export function loadThemeFromStorage(): SiteTheme | null {
  try {
    const raw = localStorage.getItem(THEME_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function applyDarkThemeToDOM(theme: SiteTheme) {
  const root = document.documentElement;
  const darkBg = '#0a0a0a';
  const darkFg = '#fafafa';
  const darkCard = '#141414';
  // Darken user's secondary by blending toward black
  const darkSecondary = blendColors(theme.secondary, '#000000', 0.82);
  const darkMuted = blendColors(theme.secondary, '#000000', 0.75);

  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--secondary', darkSecondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--background', darkBg);
  root.style.setProperty('--foreground', darkFg);
  root.style.setProperty('--card', darkCard);
  root.style.setProperty('--card-foreground', darkFg);
  root.style.setProperty('--popover', darkCard);
  root.style.setProperty('--popover-foreground', darkFg);
  root.style.setProperty('--primary-foreground', getContrastColor(theme.primary));
  root.style.setProperty('--secondary-foreground', darkFg);
  root.style.setProperty('--accent-foreground', darkFg);
  root.style.setProperty('--muted', darkMuted);
  root.style.setProperty('--muted-foreground', blendColors(darkFg, darkBg, 0.4));
  root.style.setProperty('--border', blendColors(darkFg, darkBg, 0.12));
  root.style.setProperty('--input', blendColors(darkFg, darkBg, 0.15));
  root.style.setProperty('--ring', theme.primary);
  root.style.setProperty('--radius', `${theme.radius}rem`);
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#171717' : '#fafafa';
}

function blendColors(foreground: string, background: string, alpha: number): string {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  if (!fg || !bg) return '#e5e5e5';
  const r = Math.round(bg.r + (fg.r - bg.r) * alpha);
  const g = Math.round(bg.g + (fg.g - bg.g) * alpha);
  const b = Math.round(bg.b + (fg.b - bg.b) * alpha);
  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
