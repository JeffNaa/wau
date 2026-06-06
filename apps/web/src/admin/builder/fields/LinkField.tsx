import { Input } from '@/components/ui/input';

interface LinkFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function LinkField({ label, value, onChange }: LinkFieldProps) {
  return (
    <div>
      <label className="text-[12px] font-medium mb-1.5 block">{label}</label>
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://... or /path"
        className="h-8 text-[13px]"
      />
    </div>
  );
}
