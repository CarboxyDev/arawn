interface TechBadgeProps {
  children: React.ReactNode;
}

export function TechBadge({ children }: TechBadgeProps) {
  return (
    <span className="border-border/60 hover:border-foreground/40 hover:bg-accent/50 inline-flex items-center rounded-md border bg-transparent px-3 py-1.5 text-xs font-normal transition-all duration-200 hover:scale-105">
      {children}
    </span>
  );
}
