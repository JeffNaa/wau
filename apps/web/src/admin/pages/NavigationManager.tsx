import { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Navigation, ExternalLink } from 'lucide-react';
import { webApi, type NavigationItem } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NavFormData {
  label: string;
  href: string;
  position: string;
}

const TABS = [
  { id: 'header', label: 'Header', desc: 'Top navigation bar' },
  { id: 'footer', label: 'Footer', desc: 'Bottom navigation links' },
  { id: 'dashboard_sidebar', label: 'Sidebar', desc: 'Admin sidebar menu' },
];

export default function NavigationManager() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('header');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NavFormData>({ label: '', href: '', position: 'header' });

  const loadNav = () => {
    setLoading(true);
    webApi.getNavigation()
      .then((data) => setItems(data))
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNav();
  }, []);

  const filteredItems = items
    .filter((i) => i.position === activeTab)
    .sort((a, b) => a.order - b.order);

  const handleAdd = async () => {
    if (!formData.label.trim() || !formData.href.trim()) return;
    try {
      await webApi.createNavigation({ ...formData, position: activeTab, order: filteredItems.length });
      setShowForm(false);
      setFormData({ label: '', href: '', position: 'header' });
      loadNav();
    } catch (e) {
      alert('Failed to create');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await webApi.updateNavigation(editingId, formData);
      setEditingId(null);
      setShowForm(false);
      setFormData({ label: '', href: '', position: 'header' });
      loadNav();
    } catch (e) {
      alert('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await webApi.deleteNavigation(id);
      loadNav();
    } catch (e) {
      alert('Failed to delete');
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === filteredItems.length - 1) return;

    const newItems = [...filteredItems];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];

    const orders = newItems.map((item, i) => ({ id: item.id, order: i }));
    try {
      await webApi.reorderNavigation(orders);
      loadNav();
    } catch (e) {
      alert('Failed to reorder');
    }
  };

  const startEdit = (item: NavigationItem) => {
    setEditingId(item.id);
    setFormData({ label: item.label, href: item.href, position: item.position });
    setShowForm(true);
  };

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Navigation</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Manage your site navigation menus.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-secondary/50 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowForm(false); }}
            className={`flex-1 flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold">{currentTab.label} Navigation</h2>
          <p className="text-[12px] text-muted-foreground">{currentTab.desc} — {filteredItems.length} items</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ label: '', href: '', position: activeTab });
          }}
          className="gap-1.5"
        >
          <Plus size={14} />
          Add Item
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-4 bg-secondary/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[12px] font-medium mb-1.5 block">Label</label>
                <Input
                  placeholder="e.g. Home"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="h-9"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium mb-1.5 block">URL</label>
                <Input
                  placeholder="e.g. /"
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={editingId ? handleUpdate : handleAdd}>
                {editingId ? 'Update' : 'Add Item'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Navigation size={24} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-[13px] text-muted-foreground">No navigation items yet.</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Add your first item above.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-2">
            <div className="space-y-1">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl group hover:bg-secondary/50 transition-colors"
                >
                  <GripVertical size={14} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium truncate">{item.label}</span>
                      {item.href.startsWith('http') && (
                        <ExternalLink size={11} className="text-muted-foreground shrink-0" />
                      )}
                    </div>
                    <span className="text-[12px] text-muted-foreground truncate block">{item.href}</span>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === filteredItems.length - 1}
                    >
                      <ArrowDown size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[12px]"
                      onClick={() => startEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
