interface SpacerWidgetProps {
  config: Record<string, any>;
}

export default function SpacerWidget({ config }: SpacerWidgetProps) {
  const height = config?.height || 32;

  return <div style={{ height: `${height}px` }} />;
}
