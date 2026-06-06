interface VideoWidgetProps {
  config: Record<string, any>;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  // Direct video URL
  if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
    return url;
  }
  return url;
}

export default function VideoWidget({ config }: VideoWidgetProps) {
  const url = config?.url;

  if (!url) {
    return (
      <div className="py-4">
        <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
          Video (no URL)
        </div>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(url);
  const isDirectVideo = url.match(/\.(mp4|webm|ogg)(\?.*)?$/i);

  if (isDirectVideo) {
    return (
      <div className="py-4">
        <video
          src={url}
          controls={config?.controls !== false}
          autoPlay={config?.autoplay}
          muted={config?.muted}
          loop={config?.loop}
          className="w-full rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
        <iframe
          src={embedUrl || url}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
