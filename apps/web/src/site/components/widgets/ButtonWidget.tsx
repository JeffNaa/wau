interface ButtonWidgetProps {
  config: Record<string, any>;
}

const variantMap: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
};

const sizeMap: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function ButtonWidget({ config }: ButtonWidgetProps) {
  const variantClass = variantMap[config?.variant] || variantMap.primary;
  const sizeClass = sizeMap[config?.size] || sizeMap.md;

  return (
    <div className={`py-2 ${config?.fullWidth ? 'w-full' : ''}`}>
      <a
        href={config?.link || '#'}
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors ${variantClass} ${sizeClass} ${config?.fullWidth ? 'w-full' : ''}`}
      >
        {config?.text || 'Button'}
      </a>
    </div>
  );
}
