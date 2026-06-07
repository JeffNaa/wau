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
  Mountain, Fish, Bird, Bug, Cat, Dog, Rabbit, LifeBuoy,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
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
  Mountain, Fish, Bird, Bug, Cat, Dog, Rabbit, LifeBuoy,
};

interface FeaturesWidgetProps {
  config: Record<string, any>;
}

const columnsMap: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export default function FeaturesWidget({ config }: FeaturesWidgetProps) {
  const items = config?.items || [];
  const columns = columnsMap[config?.columns] || 'grid-cols-3';
  const align = config?.align || 'center';

  if (items.length === 0) {
    return (
      <div className="py-4">
        <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
          Features (no items)
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className={`grid ${columns} gap-6`}>
        {items.map((item: any, index: number) => {
          const IconComponent = ICON_MAP[item.icon] || Star;
          return (
            <div key={index} className={`text-${align}`}>
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
                <IconComponent size={18} className="text-secondary-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1">{item.title || 'Feature'}</h3>
              <p className="text-sm text-muted-foreground">{item.description || 'Description'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
