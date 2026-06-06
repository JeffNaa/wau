import { Input } from '@/components/ui/input';

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div>
      <label className="text-[12px] font-medium mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2">
        <label className="relative w-8 h-8 rounded-lg overflow-hidden cursor-pointer shadow-sm" style={{ backgroundColor: value }}>
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-24 text-[12px] font-mono"
        />
      </div>
    </div>
  );
}
