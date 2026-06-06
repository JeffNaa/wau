interface BooleanFieldProps {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}

export default function BooleanField({ label, value, onChange }: BooleanFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-[12px] font-medium">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-9 h-5 rounded-full transition-colors ${
          value ? 'bg-primary' : 'bg-muted-foreground/30'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
