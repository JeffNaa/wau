interface TextWidgetProps {
  config: Record<string, any>;
}

const sizeMap: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export default function TextWidget({ config }: TextWidgetProps) {
  const align = config?.align || 'left';
  const sizeClass = sizeMap[config?.size] || 'text-base';

  return (
    <div className={`py-4 text-${align}`}>
      <p
        className={`${sizeClass} leading-relaxed text-muted-foreground`}
        style={{ color: config?.color || undefined }}
      >
        {config?.content || 'Text content'}
      </p>
    </div>
  );
}
