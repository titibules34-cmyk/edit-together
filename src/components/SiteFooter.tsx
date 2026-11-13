export function SiteFooter() {
  return (
    <div className="border-t border-border bg-background/70">
      <div className="mx-auto flex w-[min(100%-2rem,72rem)] flex-col gap-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Cyber Justice Ltd. All rights reserved.</p>
        <nav aria-label="Legal links" className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a href="/#contact" className="transition-colors duration-150 hover:text-foreground">Confidentiality Protocol</a>
          <span aria-hidden="true" className="text-border">•</span>
          <a href="/#contact" className="transition-colors duration-150 hover:text-foreground">Compliance &amp; Ethics</a>
          <span aria-hidden="true" className="text-border">•</span>
          <a href="/#contact" className="transition-colors duration-150 hover:text-foreground">Contact Legal</a>
        </nav>
      </div>
    </div>
  );
}
