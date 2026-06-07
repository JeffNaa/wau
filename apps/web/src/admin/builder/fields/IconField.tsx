import { useState } from 'react';
import {
  Star, Heart, Zap, Shield, Check, Lock, Eye, Globe, Users, MessageCircle,
  Phone, Mail, MapPin, Calendar, Clock, Award, Trophy, TrendingUp, BarChart, PieChart,
  Layers, Grid3x3, Box, Package, Truck, CreditCard, Wallet, Bell, Search, Settings,
  SlidersHorizontal, Filter, RefreshCw, Download, Upload, Cloud, Sun, Moon, Wifi,
  BatteryFull, Monitor, Smartphone, Camera, Music, Video, Image, FileText, BookOpen,
  Bookmark, Flag, Tag, FolderOpen, Database, Server, Code, Terminal, Cpu, HardDrive,
  Printer, PenTool, Anchor, Compass, Map, Navigation, Target, Crosshair, AlertTriangle,
  Info, HelpCircle, XCircle, CheckCircle, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  ExternalLink, Link, Share2, Copy, Pencil, Trash2, Save, Loader, Activity, HeartPulse,
  Stethoscope, Pill, FlaskConical, GraduationCap, Briefcase, Building2, Home, Hotel,
  Car, Plane, TrainFront, Bike, Bus, Ship, Rocket, Sparkles, Flame, Snowflake, Droplets,
  Wind, Thermometer, Gauge, Scale, Ruler, Paintbrush, Palette, Shirt, ShoppingBag,
  ShoppingCart, Gift, Coffee, UtensilsCrossed, Cherry, Apple, Leaf, TreePine, Flower2,
  Mountain, Fish, Bird, Bug, Cat, Dog, Rabbit, LifeBuoy, AnchorIcon,
  type LucideIcon,
} from 'lucide-react';

const ICONS: { name: string; component: LucideIcon }[] = [
  { name: 'Star', component: Star },
  { name: 'Heart', component: Heart },
  { name: 'Zap', component: Zap },
  { name: 'Shield', component: Shield },
  { name: 'Check', component: Check },
  { name: 'Lock', component: Lock },
  { name: 'Eye', component: Eye },
  { name: 'Globe', component: Globe },
  { name: 'Users', component: Users },
  { name: 'MessageCircle', component: MessageCircle },
  { name: 'Phone', component: Phone },
  { name: 'Mail', component: Mail },
  { name: 'MapPin', component: MapPin },
  { name: 'Calendar', component: Calendar },
  { name: 'Clock', component: Clock },
  { name: 'Award', component: Award },
  { name: 'Trophy', component: Trophy },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'BarChart', component: BarChart },
  { name: 'PieChart', component: PieChart },
  { name: 'Layers', component: Layers },
  { name: 'Grid3x3', component: Grid3x3 },
  { name: 'Box', component: Box },
  { name: 'Package', component: Package },
  { name: 'Truck', component: Truck },
  { name: 'CreditCard', component: CreditCard },
  { name: 'Wallet', component: Wallet },
  { name: 'Bell', component: Bell },
  { name: 'Search', component: Search },
  { name: 'Settings', component: Settings },
  { name: 'SlidersHorizontal', component: SlidersHorizontal },
  { name: 'Filter', component: Filter },
  { name: 'RefreshCw', component: RefreshCw },
  { name: 'Download', component: Download },
  { name: 'Upload', component: Upload },
  { name: 'Cloud', component: Cloud },
  { name: 'Sun', component: Sun },
  { name: 'Moon', component: Moon },
  { name: 'Wifi', component: Wifi },
  { name: 'BatteryFull', component: BatteryFull },
  { name: 'Monitor', component: Monitor },
  { name: 'Smartphone', component: Smartphone },
  { name: 'Camera', component: Camera },
  { name: 'Music', component: Music },
  { name: 'Video', component: Video },
  { name: 'Image', component: Image },
  { name: 'FileText', component: FileText },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Bookmark', component: Bookmark },
  { name: 'Flag', component: Flag },
  { name: 'Tag', component: Tag },
  { name: 'FolderOpen', component: FolderOpen },
  { name: 'Database', component: Database },
  { name: 'Server', component: Server },
  { name: 'Code', component: Code },
  { name: 'Terminal', component: Terminal },
  { name: 'Cpu', component: Cpu },
  { name: 'HardDrive', component: HardDrive },
  { name: 'Printer', component: Printer },
  { name: 'PenTool', component: PenTool },
  { name: 'Anchor', component: Anchor },
  { name: 'Compass', component: Compass },
  { name: 'Map', component: Map },
  { name: 'Navigation', component: Navigation },
  { name: 'Target', component: Target },
  { name: 'Crosshair', component: Crosshair },
  { name: 'AlertTriangle', component: AlertTriangle },
  { name: 'Info', component: Info },
  { name: 'HelpCircle', component: HelpCircle },
  { name: 'XCircle', component: XCircle },
  { name: 'CheckCircle', component: CheckCircle },
  { name: 'ArrowRight', component: ArrowRight },
  { name: 'ArrowLeft', component: ArrowLeft },
  { name: 'ArrowUp', component: ArrowUp },
  { name: 'ArrowDown', component: ArrowDown },
  { name: 'ExternalLink', component: ExternalLink },
  { name: 'Link', component: Link },
  { name: 'Share2', component: Share2 },
  { name: 'Copy', component: Copy },
  { name: 'Pencil', component: Pencil },
  { name: 'Trash2', component: Trash2 },
  { name: 'Save', component: Save },
  { name: 'Loader', component: Loader },
  { name: 'Activity', component: Activity },
  { name: 'HeartPulse', component: HeartPulse },
  { name: 'Stethoscope', component: Stethoscope },
  { name: 'Pill', component: Pill },
  { name: 'FlaskConical', component: FlaskConical },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Building2', component: Building2 },
  { name: 'Home', component: Home },
  { name: 'Hotel', component: Hotel },
  { name: 'Car', component: Car },
  { name: 'Plane', component: Plane },
  { name: 'TrainFront', component: TrainFront },
  { name: 'Bike', component: Bike },
  { name: 'Bus', component: Bus },
  { name: 'Ship', component: Ship },
  { name: 'Rocket', component: Rocket },
  { name: 'Sparkles', component: Sparkles },
  { name: 'Flame', component: Flame },
  { name: 'Snowflake', component: Snowflake },
  { name: 'Droplets', component: Droplets },
  { name: 'Wind', component: Wind },
  { name: 'Thermometer', component: Thermometer },
  { name: 'Gauge', component: Gauge },
  { name: 'Scale', component: Scale },
  { name: 'Ruler', component: Ruler },
  { name: 'Paintbrush', component: Paintbrush },
  { name: 'Palette', component: Palette },
  { name: 'Shirt', component: Shirt },
  { name: 'ShoppingBag', component: ShoppingBag },
  { name: 'ShoppingCart', component: ShoppingCart },
  { name: 'Gift', component: Gift },
  { name: 'Coffee', component: Coffee },
  { name: 'UtensilsCrossed', component: UtensilsCrossed },
  { name: 'Cherry', component: Cherry },
  { name: 'Apple', component: Apple },
  { name: 'Leaf', component: Leaf },
  { name: 'TreePine', component: TreePine },
  { name: 'Flower2', component: Flower2 },
  { name: 'Mountain', component: Mountain },
  { name: 'Fish', component: Fish },
  { name: 'Bird', component: Bird },
  { name: 'Bug', component: Bug },
  { name: 'Cat', component: Cat },
  { name: 'Dog', component: Dog },
  { name: 'Rabbit', component: Rabbit },
  { name: 'LifeBuoy', component: LifeBuoy },
];

interface IconFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function IconField({ label, value, onChange }: IconFieldProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const selected = ICONS.find((i) => i.name === value);
  const filtered = search.trim()
    ? ICONS.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : ICONS;

  return (
    <div>
      <label className="text-[12px] font-medium mb-1.5 block">{label}</label>

      {/* Selected icon display */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-background text-[13px] hover:bg-secondary/50 transition-colors"
      >
        {selected ? (
          <>
            <selected.component size={16} className="text-muted-foreground" />
            <span>{selected.name}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Select an icon...</span>
        )}
      </button>

      {/* Icon picker popover */}
      {open && (
        <div className="mt-2 rounded-xl border border-border bg-card shadow-lg p-3 z-50">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="w-full h-8 px-3 mb-2 rounded-lg border border-input bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
          <div className="grid grid-cols-6 gap-1 max-h-[200px] overflow-auto">
            {filtered.map((icon) => {
              const Icon = icon.component;
              const isSelected = icon.name === value;
              return (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => {
                    onChange(icon.name);
                    setOpen(false);
                    setSearch('');
                  }}
                  title={icon.name}
                  className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-[9px] truncate w-full text-center">{icon.name}</span>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="text-[11px] text-muted-foreground text-center py-3">No icons found</p>
          )}
        </div>
      )}
    </div>
  );
}
