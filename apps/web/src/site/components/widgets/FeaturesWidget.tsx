import { Star } from 'lucide-react';

interface FeaturesWidgetProps {
  config: Record<string, any>;
}

const columnsMap: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export default function FeaturesWidget({ config }: FeaturesWidgetProps) {
  const items = config?.items || [];
  const columns = columnsMap[config?.columns] || 'grid-cols-3';
  const align = config?.align || 'center';

  if (items.length === 0) {
    return (
      <div className="py-4">
        <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
          Features (no items)
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className={`grid ${columns} gap-6`}>
        {items.map((item: any, index: number) => (
          <div key={index} className={`text-${align}`}>
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
              <Star size={18} className="text-secondary-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1">{item.title || 'Feature'}</h3>
            <p className="text-sm text-muted-foreground">{item.description || 'Description'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
