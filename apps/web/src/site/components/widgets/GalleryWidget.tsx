interface GalleryWidgetProps {
  config: Record<string, any>;
}

const columnsMap: Record<string, string> = {
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
  '4': 'grid-cols-4',
};

export default function GalleryWidget({ config }: GalleryWidgetProps) {
  const images: string[] = config?.images || [];
  const columns = columnsMap[config?.columns] || 'grid-cols-3';
  const gap = config?.gap || 16;
  const borderRadius = config?.borderRadius || 0;

  if (images.length === 0) {
    return (
      <div className="py-4">
        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
          Gallery (no images)
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className={`grid ${columns}`} style={{ gap: `${gap}px` }}>
        {images.map((src: string, index: number) => (
          <div key={index} className="aspect-square overflow-hidden" style={{ borderRadius: `${borderRadius}px` }}>
            <img
              src={src}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
