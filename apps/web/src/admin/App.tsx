import { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { adminRoutes, adminNavItems } from './config/routes';

function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const location = useLocation();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
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
          <button className="lg:hidden p-1.5 rounded-xl hover:bg-secondary transition-colors" onClick={() => setMobileOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-auto px-3 py-2 flex flex-col gap-1">
          {adminNavItems.map((item) => {
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

        <div className="p-3 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
              <span className="text-xs font-semibold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">Admin</p>
              <p className="text-[11px] text-muted-foreground truncate">admin@wau.dev</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex lg:hidden items-center justify-between h-14 px-4 bg-card" style={{ boxShadow: '0 1px 24px rgba(0,0,0,0.03)' }}>
      <button className="p-2 rounded-xl hover:bg-secondary transition-colors" onClick={onMenuClick}>
        <Menu size={18} />
      </button>
    </header>
  );
}

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-[2.5px] border-primary/20 border-t-primary" />
              </div>
            }
          >
            <Routes>
              {adminRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={<route.component />} />
              ))}
              {(() => {
                const Fallback = adminRoutes[0].component;
                return <Route path="/admin/*" element={<Fallback />} />;
              })()}
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function AdminApp() {
  return (
    <BrowserRouter>
      <AdminLayout />
    </BrowserRouter>
  );
}

export default AdminApp;
