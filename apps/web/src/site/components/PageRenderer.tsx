import { useEffect } from 'react';
import type { Page } from '@/lib/api';
import HeroWidget from './widgets/HeroWidget';
import TextWidget from './widgets/TextWidget';
import ImageWidget from './widgets/ImageWidget';
import ButtonWidget from './widgets/ButtonWidget';
import DividerWidget from './widgets/DividerWidget';
import SpacerWidget from './widgets/SpacerWidget';
import GalleryWidget from './widgets/GalleryWidget';
import FeaturesWidget from './widgets/FeaturesWidget';
import VideoWidget from './widgets/VideoWidget';
import HtmlWidget from './widgets/HtmlWidget';

interface PageRendererProps {
  page: Page | null;
}

const widgetMap: Record<string, React.FC<{ config: Record<string, any> }>> = {
  'wau:hero': HeroWidget,
  'wau:text': TextWidget,
  'wau:image': ImageWidget,
  'wau:button': ButtonWidget,
  'wau:divider': DividerWidget,
  'wau:spacer': SpacerWidget,
  'wau:gallery': GalleryWidget,
  'wau:features': FeaturesWidget,
  'wau:video': VideoWidget,
  'wau:html': HtmlWidget,
};

function WidgetRenderer({ type, config }: { type: string; config: Record<string, any> }) {
  const Component = widgetMap[type];
  if (!Component) {
    return (
      <div className="py-4 px-4 border border-dashed border-border rounded-lg">
        <p className="text-[12px] text-muted-foreground">
          Unknown widget: <span className="font-mono">{type}</span>
        </p>
      </div>
    );
  }
  return <Component config={config} />;
}

const colSpanMap: Record<number, string> = {
  1: 'col-span-12 md:col-span-1',
  2: 'col-span-12 md:col-span-2',
  3: 'col-span-12 md:col-span-3',
  4: 'col-span-12 md:col-span-4',
  5: 'col-span-12 md:col-span-5',
  6: 'col-span-12 md:col-span-6',
  7: 'col-span-12 md:col-span-7',
  8: 'col-span-12 md:col-span-8',
  9: 'col-span-12 md:col-span-9',
  10: 'col-span-12 md:col-span-10',
  11: 'col-span-12 md:col-span-11',
  12: 'col-span-12',
};

function ColumnRenderer({ column }: { column: any }) {
  const widthClass = colSpanMap[column.width] || 'col-span-12';

  return (
    <div className={widthClass}>
      {column.widgets?.map((widget: any, wIdx: number) => (
        <div key={wIdx}>
          <WidgetRenderer type={widget.type} config={widget.config} />
        </div>
      ))}
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
            <ColumnRenderer key={idx} column={col} />
          )) || (
            <div className="col-span-12">
              <WidgetRenderer type={section.type || 'wau:text'} config={section.config} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function PageRenderer({ page }: PageRendererProps) {
  useEffect(() => {
    if (page) {
      document.title = page.title;
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', page.meta?.description || page.title);
    }
  }, [page?.title, page?.meta]);

  if (!page) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-1.5">Page Not Found</h2>
          <p className="text-[13px] text-muted-foreground">
            Create a page in the Dashboard to get started.
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
