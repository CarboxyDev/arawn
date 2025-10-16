import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-border mt-24 border-t">
      <div className="mx-auto max-w-7xl px-8 py-6">
        <div className="text-muted-foreground flex items-center justify-center gap-6 text-sm">
          <span>By CarboxyDev</span>
          <span>•</span>
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <span>•</span>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  );
}
