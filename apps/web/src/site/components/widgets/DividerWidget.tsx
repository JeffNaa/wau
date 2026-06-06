interface DividerWidgetProps {
  config: Record<string, any>;
}

export default function DividerWidget({ config }: DividerWidgetProps) {
  const style = config?.style || 'solid';
  const color = config?.color || '#e5e7eb';
  const thickness = config?.thickness || 1;
  const width = config?.width === 'partial' ? 'w-1/3 mx-auto' : 'w-full';

  return (
    <div className="py-4">
      <div
        className={width}
        style={{
          borderTop: `${thickness}px ${style} ${color}`,
        }}
      />
    </div>
  );
}
