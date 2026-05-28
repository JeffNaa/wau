import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { webApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SiteTheme } from '@/site/store/themeStore';
import { defaultTheme } from '@/site/store/themeStore';

const presetThemes = [
  { name: 'Zinc', primary: '#18181b', secondary: '#f4f4f5', accent: '#f4f4f5' },
  { name: 'Blue', primary: '#2563eb', secondary: '#eff6ff', accent: '#dbeafe' },
  { name: 'Emerald', primary: '#059669', secondary: '#ecfdf5', accent: '#d1fae5' },
  { name: 'Rose', primary: '#e11d48', secondary: '#fff1f2', accent: '#ffe4e6' },
  { name: 'Orange', primary: '#ea580c', secondary: '#fff7ed', accent: '#ffedd5' },
  { name: 'Violet', primary: '#7c3aed', secondary: '#f5f3ff', accent: '#ede9fe' },
];

export default function ThemeSettings() {
  const [theme, setTheme] = useState<SiteTheme>(defaultTheme);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    webApi.getConfig('site_theme')
      .then((c: any) => {
        if (c?.value) setTheme({ ...defaultTheme, ...c.value });
      })
      .catch(() => { });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await webApi.updateConfig('site_theme', theme);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert('Failed to save theme');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: any) => {
    setTheme((t) => ({ ...t, primary: preset.primary, secondary: preset.secondary, accent: preset.accent }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Theme Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Customize the look and feel of your site.</p>
      </div>

      {/* Presets */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Color Presets</CardTitle>
          <CardDescription className="text-[13px]">Choose a predefined color scheme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {presetThemes.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="group flex flex-col items-center gap-2.5 p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-all"
              >
                <div className="w-10 h-10 rounded-2xl shadow-sm transition-transform group-hover:scale-105" style={{ backgroundColor: preset.primary }} />
                <span className="text-[11px] font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Custom Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            { key: 'primary' as const, label: 'Primary', desc: 'Buttons, links, active states' },
            { key: 'secondary' as const, label: 'Secondary', desc: 'Subtle backgrounds, badges' },
            { key: 'accent' as const, label: 'Accent', desc: 'Highlights, call-to-actions' },
            { key: 'background' as const, label: 'Background', desc: 'Page background color' },
            { key: 'foreground' as const, label: 'Foreground', desc: 'Text and icons' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-medium">{label}</p>
                <p className="text-[12px] text-muted-foreground">{desc}</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <label className="relative w-9 h-9 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow transition-shadow" style={{ backgroundColor: theme[key] }}>
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(e) => setTheme((t) => ({ ...t, [key]: e.target.value }))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
                <Input
                  type="text"
                  value={theme[key]}
                  onChange={(e) => setTheme((t) => ({ ...t, [key]: e.target.value }))}
                  className="w-[88px] h-8 text-[13px] font-mono"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Radius */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Border Radius</CardTitle>
          <CardDescription className="text-[13px]">Control the roundness of UI elements.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.125"
              value={theme.radius}
              onChange={(e) => setTheme((t) => ({ ...t, radius: parseFloat(e.target.value) }))}
              className="flex-1 accent-foreground"
            />
            <span className="text-[13px] font-mono w-12 text-right">{theme.radius}rem</span>
          </div>
          <div className="flex gap-2 mt-5">
            {[0, 0.375, 0.625, 1].map((r) => (
              <button
                key={r}
                onClick={() => setTheme((t) => ({ ...t, radius: r }))}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all ${
                  theme.radius === r
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {r === 0 ? '0px' : `${r}rem`}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="mb-6" style={{ backgroundColor: theme.background, color: theme.foreground }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">Sample Heading</h3>
          <p className="opacity-80">This is how your text will look with the selected theme.</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 rounded-xl text-sm font-medium text-white shadow-sm" style={{ backgroundColor: theme.primary }}>
              Primary Button
            </span>
            <span className="px-4 py-2 rounded-xl text-sm font-medium shadow-sm" style={{ backgroundColor: theme.secondary, color: theme.foreground }}>
              Secondary
            </span>
            <span className="px-4 py-2 rounded-xl text-sm font-medium text-white shadow-sm" style={{ backgroundColor: theme.accent }}>
              Accent
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={loading} size="sm">
          {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setTheme(defaultTheme)} className="gap-1.5">
          <RotateCcw size={14} />
          Reset
        </Button>
      </div>
    </div>
  );
}
