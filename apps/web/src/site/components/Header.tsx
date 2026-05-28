import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { webApi, type NavigationItem } from '@/lib/api';

export default function Header() {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    webApi.getNavigation('header').then(setNavItems).catch(() => { });
    webApi.getConfig('site_header')
      .then((c: any) => setConfig(c?.value || {}))
      .catch(() => { });
  }, []);

  const logo = config.logo || 'Wau';

  return (
    <header className="w-full z-50 sticky top-0"
      style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <a href="/" className="text-base font-semibold tracking-tight">
            {logo}
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="px-3 py-1.5 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            className="md:hidden p-1.5 rounded-xl hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="md:hidden pb-3 flex flex-col gap-0.5">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="px-3 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
