import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wau_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Web APIs ───

export interface Page {
  id: string;
  slug: string;
  title: string;
  layout: Record<string, any>;
  meta: Record<string, any>;
  isHome: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  position: string;
  order: number;
  parentId: string | null;
  children: NavigationItem[];
}

export interface WidgetRegistryItem {
  id: string;
  type: string;
  name: string;
  category: string;
  configSchema: Record<string, any>;
  icon: string | null;
  isBuiltIn: boolean;
  plugin: string | null;
}

export const webApi = {
  // Config
  getAllConfigs: () => api.get('web/config').then((r) => r.data),
  getConfig: (key: string) => api.get(`web/config/${key}`).then((r) => r.data),
  updateConfig: (key: string, value: any) => api.put(`web/config/${key}`, { value }).then((r) => r.data),

  // Pages
  getAllPages: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('web/pages', { params }).then((r) => r.data as { data: Page[]; total: number; page: number; limit: number }),
  getPageBySlug: (slug: string) => api.get(`web/pages/${slug}`).then((r) => r.data as Page),
  getHomePage: () => api.get('web/pages/home/default').then((r) => r.data as Page | null),
  createPage: (data: any) => api.post('web/pages', data).then((r) => r.data),
  updatePage: (slug: string, data: any) => api.put(`web/pages/${slug}`, data).then((r) => r.data),
  deletePage: (slug: string) => api.delete(`web/pages/${slug}`).then((r) => r.data),
  setHomePage: (slug: string) => api.put(`web/pages/${slug}/home`).then((r) => r.data),

  // Navigation
  getNavigation: (position?: string) =>
    api.get('web/navigation', { params: position ? { position } : undefined }).then((r) => r.data as NavigationItem[]),
  createNavigation: (data: any) => api.post('web/navigation', data).then((r) => r.data),
  updateNavigation: (id: string, data: any) => api.put(`web/navigation/${id}`, data).then((r) => r.data),
  deleteNavigation: (id: string) => api.delete(`web/navigation/${id}`).then((r) => r.data),
  reorderNavigation: (orders: { id: string; order: number }[]) =>
    api.put('web/navigation/reorder', { orders }).then((r) => r.data),

  // Widgets
  getAllWidgets: () => api.get('web/widgets').then((r) => r.data as WidgetRegistryItem[]),
  getWidgetByType: (type: string) => api.get(`web/widgets/${type}`).then((r) => r.data as WidgetRegistryItem),
};

// ─── Auth APIs ───

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  permissions: string[];
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post('auth/login', { email, password }).then((r) => r.data),
  me: () => api.get('auth/me').then((r) => r.data as User),
};
