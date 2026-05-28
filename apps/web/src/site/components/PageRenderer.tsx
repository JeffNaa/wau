import { type Page } from '@/lib/api';

interface PageRendererProps {
  page: Page | null;
}

export default function PageRenderer({ page }: PageRendererProps) {
  if (!page) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-1.5">Home Page Not Found</h2>
          <p className="text-[13px] text-muted-foreground">
            Create a home page in the Dashboard to get started.
          </p>
        </div>
      </div>
    );
  }

  const sections = page.layout?.sections || [];

  return (
    <div>
      {sections.length === 0 ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">{page.title}</h1>
            <p className="text-[13px] text-muted-foreground">This page is ready for content. Use the page builder to add sections.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {sections.map((section: any, idx: number) => (
            <SectionRenderer key={idx} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionRenderer({ section }: { section: any }) {
  return (
    <section
      className="w-full"
      style={{
        padding: section.padding || '4rem 1rem',
        backgroundColor: section.backgroundColor || 'transparent',
      }}
    >
      <div className={section.fullWidth ? 'w-full' : 'max-w-5xl mx-auto px-4 sm:px-6'}>
        <div className="grid grid-cols-12 gap-4">
          {section.columns?.map((col: any, idx: number) => (
            <div key={idx} className={`col-span-12 md:col-span-${col.width || 12}`}>
              {col.widgets?.map((widget: any, wIdx: number) => (
                <div key={wIdx} className="mb-4">
                  <WidgetPlaceholder type={widget.type} config={widget.config} />
                </div>
              ))}
            </div>
          )) || (
            <div className="col-span-12">
              <WidgetPlaceholder type={section.type || 'wau:text'} config={section.config} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function WidgetPlaceholder({ type, config }: { type: string; config: any }) {
  switch (type) {
    case 'wau:hero':
      return (
        <div className="text-center py-12">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">{config?.title || 'Hero Title'}</h1>
          <p className="text-base text-muted-foreground mb-6">{config?.subtitle || 'Subtitle here'}</p>
          {config?.buttonText && (
            <a
              href={config?.buttonLink || '#'}
              className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
            >
              {config.buttonText}
            </a>
          )}
        </div>
      );
    case 'wau:text':
      return (
        <div className={`text-${config?.align || 'left'} py-4`}>
          <p className="text-[13px] leading-relaxed text-muted-foreground">{config?.content || 'Text content'}</p>
        </div>
      );
    case 'wau:image':
      return (
        <div className="py-4">
          {config?.src ? (
            <img
              src={config.src}
              alt={config?.alt || ''}
              className="max-w-full h-auto rounded-lg"
              style={{ width: config?.width, height: config?.height }}
            />
          ) : (
            <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-[13px]">
              Image placeholder
            </div>
          )}
        </div>
      );
    case 'wau:button':
      return (
        <div className="py-2">
          <a
            href={config?.link || '#'}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            {config?.text || 'Button'}
          </a>
        </div>
      );
    default:
      return (
        <div className="py-4 px-4 border border-dashed border-border rounded-lg">
          <p className="text-[12px] text-muted-foreground">
            Widget: <span className="font-mono">{type}</span>
          </p>
        </div>
      );
  }
}
