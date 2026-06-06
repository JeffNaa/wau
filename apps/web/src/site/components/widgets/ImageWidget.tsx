interface ImageWidgetProps {
  config: Record<string, any>;
}

export default function ImageWidget({ config }: ImageWidgetProps) {
  if (!config?.src) {
    return (
      <div className="py-4">
        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
          Image placeholder
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <img
        src={config.src}
        alt={config?.alt || ''}
        className="max-w-full h-auto"
        style={{
          width: config?.width ? `${config.width}px` : '100%',
          height: config?.height ? `${config.height}px` : 'auto',
          objectFit: config?.objectFit || 'cover',
          borderRadius: config?.borderRadius ? `${config.borderRadius}px` : undefined,
        }}
        loading="lazy"
      />
    </div>
  );
}
