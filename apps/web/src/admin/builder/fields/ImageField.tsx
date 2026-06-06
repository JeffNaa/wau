import { Input } from '@/components/ui/input';

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ImageField({ label, value, onChange }: ImageFieldProps) {
  return (
    <div>
      <label className="text-[12px] font-medium mb-1.5 block">{label}</label>
      <div className="space-y-2">
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="h-8 text-[13px]"
        />
        {value && (
          <img src={value} alt="" className="w-full h-20 object-cover rounded-lg" />
        )}
      </div>
    </div>
  );
}
