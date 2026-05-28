import { useEffect, useState } from 'react';
import { webApi } from '@/lib/api';

export default function Footer() {
  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    webApi.getConfig('site_footer')
      .then((c: any) => setConfig(c?.value || {}))
      .catch(() => { });
  }, []);

  const copyright = config.copyright || `© ${new Date().getFullYear()} Wau`;
  const columns = config.columns || [];
  const social = config.social || [];

  return (
    <footer className="w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {columns.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {columns.map((col: any, i: number) => (
              <div key={i}>
                <h4 className="text-[13px] font-semibold mb-3 text-foreground">{col.title}</h4>
                {col.links?.map((link: any, j: number) => (
                  <a key={j} href={link.href} className="block text-[13px] py-1 text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
          <p className="text-[12px] text-muted-foreground">{copyright}</p>
          {social.length > 0 && (
            <div className="flex gap-4">
              {social.map((s: any, i: number) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
