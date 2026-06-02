import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
  Outlet,
} from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminNavItems, iconMap } from './config/routes';
import { webApi, authApi, type User } from '@/lib/api';
import {
  applyThemeToDOM,
  applyDarkThemeToDOM,
  loadThemeFromStorage,
  type SiteTheme,
  defaultTheme,
} from '@/site/store/themeStore';

// Import page components directly
import DashboardHome from './pages/DashboardHome';
import ThemeSettings from './pages/ThemeSettings';
import NavigationManager from './pages/NavigationManager';
import Login from './pages/Login';

/* ─── Auth Guard ─── */

function isAuthenticated() {
  return !!localStorage.getItem('wau_token');
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/admin/login';

  if (isLoginPage) {
    return isAuthenticated() ? <Navigate to="/admin/dashboard" replace /> : <>{children}</>;
  }

  return isAuthenticated() ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

/* ─── Sidebar ─── */

interface SidebarNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

function Sidebar({
  mobileOpen,
  setMobileOpen,
  dark,
  setDark,
  user,
}: {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  user: User | null;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const [navItems, setNavItems] = useState<SidebarNavItem[]>(adminNavItems);

  useEffect(() => {
    webApi
      .getNavigation('dashboard_sidebar')
      .then((items) => {
        if (items && items.length > 0) {
          const mapped: SidebarNavItem[] = items.map((item) => {
            const key = item.label.toLowerCase().replace(/\s+/g, '_');
            return {
              path: item.href,
              label: item.label,
              icon: iconMap[key] || iconMap['settings'] || adminNavItems[0].icon,
            };
          });
          setNavItems(mapped);
        }
      })
      .catch(() => {
        // keep defaults
      });
  }, []);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-[240px] bg-card flex flex-col transition-all duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.03)' }}
      >
        <div className="flex items-center justify-between h-16 px-5 shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">W</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">Wau</span>
          </Link>
          <button
            className="lg:hidden p-1.5 rounded-xl hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-auto px-3 py-2 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon size={16} strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-3 shrink-0 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold">
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email || 'admin@wau.dev'}</p>
            </div>
          </div>
        </div>

        {/* Dark/Light toggle */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all w-full"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? t('common.lightMode') : t('common.darkMode')}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ─── Topbar ─── */

function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.replace('/admin/', '').split('/').filter(Boolean);
  const label = parts[0]?.replace(/-/g, ' ') || 'Dashboard';
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
      <span>Admin</span>
      <ChevronRight size={12} className="text-muted-foreground/50" />
      <span className="font-medium text-foreground">{capitalized}</span>
    </div>
  );
}

function UserMenu({ user }: { user: User | null }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('wau_token');
    navigate('/admin/login', { replace: true });
  };

  const initial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-secondary transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <span className="text-[11px] font-semibold">{initial}</span>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-52 bg-card rounded-xl border border-border shadow-lg z-50 py-1">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-[13px] font-medium">{user?.name || 'Admin'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email || 'admin@wau.dev'}</p>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut size={14} />
              {t('common.logout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Topbar({ onMenuClick, user }: { onMenuClick: () => void; user: User | null }) {
  return (
    <header
      className="flex items-center justify-between h-14 px-4 bg-card"
      style={{ boxShadow: '0 1px 24px rgba(0,0,0,0.03)' }}
    >
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
          onClick={onMenuClick}
        >
          <Menu size={18} />
        </button>
        <div className="hidden sm:block">
          <Breadcrumb />
        </div>
      </div>
      <UserMenu user={user} />
    </header>
  );
}

/* ─── Layout ─── */

function applyCachedTheme(isDark: boolean) {
  const cached = loadThemeFromStorage();
  const theme = cached || defaultTheme;
  if (isDark) {
    applyDarkThemeToDOM(theme);
  } else {
    applyThemeToDOM(theme);
  }
}

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [user, setUser] = useState<User | null>(null);

  // Apply cached theme synchronously on first render to avoid flash
  const initialDark = document.documentElement.classList.contains('dark');
  applyCachedTheme(initialDark);

  const refreshTheme = (isDark: boolean) => {
    webApi.getConfig('site_theme')
      .then((c: any) => {
        const theme: SiteTheme = { ...defaultTheme, ...(c?.value || {}) };
        if (isDark) {
          applyDarkThemeToDOM(theme);
        } else {
          applyThemeToDOM(theme);
        }
      })
      .catch(() => applyCachedTheme(isDark));
  };

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    refreshTheme(dark);
  }, [dark]);

  useEffect(() => {
    const onThemeUpdate = () => refreshTheme(dark);
    window.addEventListener('theme-updated', onThemeUpdate);
    return () => window.removeEventListener('theme-updated', onThemeUpdate);
  }, [dark]);

  useEffect(() => {
    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} dark={dark} setDark={setDark} user={user} />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Topbar onMenuClick={() => setMobileOpen(true)} user={user} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ─── App ─── */

function AdminApp() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="theme" element={<ThemeSettings />} />
            <Route path="navigation" element={<NavigationManager />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}

export default AdminApp;
