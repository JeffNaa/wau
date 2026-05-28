import { useEffect } from 'react';
import { webApi } from '@/lib/api';
import { useThemeStore, defaultTheme, type SiteTheme } from '@/site/store/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const applyTheme = useThemeStore((s) => s.applyTheme);

  useEffect(() => {
    webApi.getConfig('site_theme')
      .then((config: any) => {
        const theme: SiteTheme = { ...defaultTheme, ...(config?.value || {}) };
        applyTheme(theme);
      })
      .catch(() => {
        applyTheme(defaultTheme);
      });
  }, [applyTheme]);

  return <>{children}</>;
}
