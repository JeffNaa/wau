interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TextField({ label, value, onChange }: TextFieldProps) {
  return (
    <div>
      <label className="text-[12px] font-medium mb-1.5 block">{label}</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
