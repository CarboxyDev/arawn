'use client';

import { Button } from '@repo/packages-ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/packages-ui/select';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface RefreshControlProps {
  interval: number | null;
  onIntervalChange: (interval: number | null) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

const INTERVALS = [
  { value: '5000', label: '5s' },
  { value: '15000', label: '15s' },
  { value: '30000', label: '30s' },
  { value: '60000', label: '1m' },
  { value: 'off', label: 'Off' },
];

export function RefreshControl({
  interval,
  onIntervalChange,
  onRefresh,
  isRefreshing,
  lastUpdated,
}: RefreshControlProps) {
  const handleIntervalChange = (value: string) => {
    if (value === 'off') {
      onIntervalChange(null);
    } else {
      onIntervalChange(parseInt(value, 10));
    }
  };

  return (
    <div className="flex items-center gap-3">
      {lastUpdated && (
        <span className="text-muted-foreground text-xs">
          Updated {lastUpdated.toLocaleTimeString()}
        </span>
      )}
      <div className="flex items-center gap-2">
        <Select
          value={interval?.toString() ?? 'off'}
          onValueChange={handleIntervalChange}
        >
          <SelectTrigger className="h-8 w-[80px] text-xs">
            <SelectValue placeholder="Auto" />
          </SelectTrigger>
          <SelectContent>
            {INTERVALS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-8 gap-1.5 px-2.5"
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={
              isRefreshing
                ? { duration: 1, repeat: Infinity, ease: 'linear' }
                : { duration: 0 }
            }
          >
            <RefreshCw className="size-3.5" />
          </motion.div>
          <span className="text-xs">Refresh</span>
        </Button>
      </div>
    </div>
  );
}
