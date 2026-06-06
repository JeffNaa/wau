import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import StringField from './StringField';
import TextField from './TextField';

interface ArrayFieldProps {
  label: string;
  value: any[];
  itemSchema?: Record<string, { type: string; label: string }>;
  itemType?: string;
  onChange: (value: any[]) => void;
}

export default function ArrayField({ label, value, itemSchema, itemType, onChange }: ArrayFieldProps) {
  const items = value || [];
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const addItem = () => {
    let newItem: any;
    if (itemType === 'image') {
      newItem = '';
    } else if (itemSchema) {
      newItem = {};
      Object.entries(itemSchema).forEach(([key, schema]) => {
        newItem[key] = schema.type === 'text' || schema.type === 'string' ? '' : undefined;
      });
    } else {
      newItem = '';
    }
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, newItem: any) => {
    const newItems = [...items];
    newItems[index] = newItem;
    onChange(newItems);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[12px] font-medium">{label}</label>
        <button
          onClick={addItem}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-[11px] font-medium hover:bg-secondary/80 transition-colors"
        >
          <Plus size={11} />
          Add
        </button>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-border bg-secondary/30">
            <button
              onClick={() => setExpanded((prev) => ({ ...prev, [index]: !prev[index] }))}
              className="w-full flex items-center justify-between px-3 py-2 text-[12px]"
            >
              <span className="font-medium truncate">
                {typeof item === 'string' ? item || `Item ${index + 1}` : item?.title || `Item ${index + 1}`}
              </span>
              <div className="flex items-center gap-1">
                {expanded[index] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </div>
            </button>
            {expanded[index] && (
              <div className="px-3 pb-3 space-y-3">
                {typeof item === 'string' ? (
                  <StringField
                    label="URL"
                    value={item}
                    onChange={(v) => updateItem(index, v)}
                  />
                ) : itemSchema ? (
                  Object.entries(itemSchema).map(([key, schema]) => {
                    const val = item[key] || '';
                    if (schema.type === 'string') {
                      return (
                        <StringField
                          key={key}
                          label={schema.label}
                          value={val}
                          onChange={(v) => updateItem(index, { ...item, [key]: v })}
                        />
                      );
                    }
                    if (schema.type === 'text') {
                      return (
                        <TextField
                          key={key}
                          label={schema.label}
                          value={val}
                          onChange={(v) => updateItem(index, { ...item, [key]: v })}
                        />
                      );
                    }
                    return null;
                  })
                ) : (
                  <StringField
                    label="Value"
                    value={String(item)}
                    onChange={(v) => updateItem(index, v)}
                  />
                )}
                <button
                  onClick={() => removeItem(index)}
                  className="flex items-center gap-1 text-[11px] text-destructive hover:text-destructive/80"
                >
                  <Trash2 size={11} />
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
