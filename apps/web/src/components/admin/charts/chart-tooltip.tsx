'use client';

import { cn } from '@repo/packages-ui/lib/utils';

interface TooltipPayload {
  value?: number;
  name?: string;
  color?: string;
  payload?: { color?: string };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  labelFormatter?: (label: string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const formattedLabel =
    labelFormatter && label ? labelFormatter(label) : label;

  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2 shadow-lg',
        'bg-white/90 dark:bg-zinc-900/90',
        'backdrop-blur-md',
        'border-zinc-200/50 dark:border-zinc-700/50'
      )}
    >
      {formattedLabel && (
        <p className="mb-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          {formattedLabel}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry: TooltipPayload, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-zinc-600 dark:text-zinc-400">
              {entry.name}:
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SimpleChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  labelFormatter?: (label: string) => string;
  valueFormatter?: (value: number, name: string) => [string, string];
}

export function SimpleChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}: SimpleChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const formattedLabel =
    labelFormatter && label ? labelFormatter(label) : label;

  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2 shadow-lg',
        'bg-white/90 dark:bg-zinc-900/90',
        'backdrop-blur-md',
        'border-zinc-200/50 dark:border-zinc-700/50'
      )}
    >
      {formattedLabel && (
        <p className="mb-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          {formattedLabel}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry: TooltipPayload, index: number) => {
          const [formattedValue, formattedName] = valueFormatter
            ? valueFormatter(entry.value as number, entry.name as string)
            : [entry.value?.toLocaleString(), entry.name];

          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.payload?.color }}
              />
              <span className="text-zinc-600 dark:text-zinc-400">
                {formattedName}:
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
