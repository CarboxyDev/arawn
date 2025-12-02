'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/packages-ui/tooltip';
import { Check, Copy, Info } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CommandBlockProps {
  command: string;
  tooltipContent?: string;
  step?: number;
}

export function CommandBlock({
  command,
  tooltipContent,
  step,
}: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    toast.success('Copied command to clipboard!');
    setTimeout(() => setCopied(false), 5000);
  };

  return (
    <div className="border-border bg-card text-card-foreground flex items-center justify-between gap-3 rounded-md border px-4 py-3">
      <div className="flex items-center gap-3">
        {step !== undefined && (
          <div className="bg-primary/10 text-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
            {step}
          </div>
        )}
        <span className="font-mono text-sm">
          <span className="text-muted-foreground">$</span> {command}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {tooltipContent && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                aria-label="Command information"
              >
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs" sideOffset={8}>
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          aria-label={copied ? 'Copied!' : 'Copy command'}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
