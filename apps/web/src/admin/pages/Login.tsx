import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn } from 'lucide-react';
import { authApi, webApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  applyThemeToDOM,
  applyDarkThemeToDOM,
  loadThemeFromStorage,
  defaultTheme,
  type SiteTheme,
} from '@/site/store/themeStore';

// Apply cached theme synchronously before React renders to avoid flash
const isDark = document.documentElement.classList.contains('dark');
const cached = loadThemeFromStorage();
const initialTheme = cached || defaultTheme;
if (isDark) {
  applyDarkThemeToDOM(initialTheme);
} else {
  applyThemeToDOM(initialTheme);
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Silently refresh theme from API in background
  useEffect(() => {
    webApi.getConfig('site_theme')
      .then((c: any) => {
        if (c?.value) {
          const theme: SiteTheme = { ...defaultTheme, ...c.value };
          if (isDark) {
            applyDarkThemeToDOM(theme);
          } else {
            applyThemeToDOM(theme);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError(t('auth.required'));
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const token = res.token?.token || res.access_token || res.token;
      if (!token || typeof token !== 'string') {
        setError(t('auth.invalidResponse'));
        return;
      }
      localStorage.setItem('wau_token', token);
      navigate('/admin/dashboard', { replace: true });
    } catch (e: any) {
      setError(e.response?.data?.message || t('auth.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">W</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">Wau Dashboard</span>
        </div>

        <Card>
          <CardContent className="p-6">
            <h1 className="text-base font-semibold mb-1">{t('auth.loginTitle')}</h1>
            <p className="text-[13px] text-muted-foreground mb-5">{t('auth.loginSubtitle')}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[12px] font-medium mb-1.5 block">{t('auth.email')}</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="h-9"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[12px] font-medium mb-1.5 block">{t('auth.password')}</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="h-9"
                />
              </div>

              {error && (
                <p className="text-[12px] text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full gap-1.5" disabled={loading}>
                <LogIn size={14} />
                {loading ? t('auth.submitting') : t('auth.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
