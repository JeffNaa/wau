import { Input } from '@/components/ui/input';

interface StringFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function StringField({ label, value, onChange }: StringFieldProps) {
  return (
    <div>
      <label className="text-[12px] font-medium mb-1.5 block">{label}</label>
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-[13px]"
      />
    </div>
  );
}
