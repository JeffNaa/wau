import { type ComponentType } from 'react';
import {
  LayoutDashboard,
  Palette,
  Navigation,
  FileText,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface AdminRoute {
  path: string;
  label: string;
  icon: LucideIcon;
  component: ComponentType;
}

import DashboardHome from '../pages/DashboardHome';
import ThemeSettings from '../pages/ThemeSettings';
import NavigationManager from '../pages/NavigationManager';
import Login from '../pages/Login';

export const adminRoutes: AdminRoute[] = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, component: DashboardHome },
  { path: '/admin/theme', label: 'Theme', icon: Palette, component: ThemeSettings },
  { path: '/admin/navigation', label: 'Navigation', icon: Navigation, component: NavigationManager },
];

export const loginRoute = { path: '/admin/login', component: Login };

export const adminNavItems = adminRoutes.map(({ path, label, icon }) => ({ path, label, icon }));

// Fallback icon mapping for dynamic sidebar nav items
export const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  theme: Palette,
  navigation: Navigation,
  pages: FileText,
  settings: Settings,
};
