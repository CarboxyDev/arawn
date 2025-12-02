import { Terminal } from 'lucide-react';
import React from 'react';

export function TerminalSkeleton(): React.ReactElement {
  return (
    <div className="border-border bg-muted/30 flex h-full min-h-[400px] items-center justify-center rounded-lg border p-8 lg:min-h-[500px]">
      <div className="text-muted-foreground flex flex-col items-center gap-4">
        <Terminal className="h-16 w-16 opacity-20" />
        <p className="text-sm">Terminal animation placeholder</p>
      </div>
    </div>
  );
}
