interface HeroWidgetProps {
  config: Record<string, any>;
}

export default function HeroWidget({ config }: HeroWidgetProps) {
  const align = config?.align || 'center';
  const minHeight = config?.minHeight ? `${config.minHeight}px` : 'auto';

  return (
    <div
      className="relative w-full flex items-center justify-center"
      style={{
        minHeight,
        backgroundImage: config?.backgroundImage ? `url(${config.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {config?.backgroundImage && <div className="absolute inset-0 bg-black/40" />}
      <div className={`relative z-10 max-w-3xl mx-auto px-4 py-12 text-${align}`}>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          {config?.title || 'Hero Title'}
        </h1>
        <p className="text-base text-muted-foreground mb-6">
          {config?.subtitle || 'Subtitle here'}
        </p>
        {config?.buttonText && (
          <a
            href={config?.buttonLink || '#'}
            className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            {config.buttonText}
          </a>
        )}
      </div>
    </div>
  );
}
