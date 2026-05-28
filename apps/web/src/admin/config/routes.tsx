import { lazy, type ComponentType } from 'react';
import { LayoutDashboard, Palette, Navigation, type LucideIcon } from 'lucide-react';

export interface AdminRoute {
  path: string;
  label: string;
  icon: LucideIcon;
  component: ComponentType;
}

const DashboardHome = lazy(() => import('../pages/DashboardHome'));
const ThemeSettings = lazy(() => import('../pages/ThemeSettings'));
const NavigationManager = lazy(() => import('../pages/NavigationManager'));

export const adminRoutes: AdminRoute[] = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, component: DashboardHome },
  { path: '/admin/theme', label: 'Theme', icon: Palette, component: ThemeSettings },
  { path: '/admin/navigation', label: 'Navigation', icon: Navigation, component: NavigationManager },
];

export const adminNavItems = adminRoutes.map(({ path, label, icon }) => ({ path, label, icon }));
