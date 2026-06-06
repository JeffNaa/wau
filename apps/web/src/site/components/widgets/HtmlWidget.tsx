interface HtmlWidgetProps {
  config: Record<string, any>;
}

export default function HtmlWidget({ config }: HtmlWidgetProps) {
  if (!config?.html) {
    return (
      <div className="py-4">
        <div className="w-full p-4 bg-muted rounded-lg text-muted-foreground text-sm">
          HTML (empty)
        </div>
      </div>
    );
  }

  return (
    <div
      className="py-4"
      dangerouslySetInnerHTML={{ __html: config.html }}
    />
  );
}
