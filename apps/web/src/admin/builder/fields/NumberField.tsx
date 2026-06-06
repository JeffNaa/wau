interface NumberFieldProps {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
}

export default function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <div>
      <label className="text-[12px] font-medium mb-1.5 block">{label}</label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const v = e.target.value === '' ? 0 : Number(e.target.value);
          onChange(v);
        }}
        className="w-full h-8 px-3 rounded-lg border border-input bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
