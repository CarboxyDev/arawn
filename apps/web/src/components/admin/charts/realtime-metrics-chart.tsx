'use client';

import type { RealtimeMetricsPoint } from '@repo/packages-types/stats';
import { cn } from '@repo/packages-ui/lib/utils';
import { Skeleton } from '@repo/packages-ui/skeleton';
import { formatTime } from '@repo/packages-utils/date';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Cpu,
  HardDrive,
  Pause,
  Timer,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useRealtimeMetrics } from '@/hooks/use-realtime-metrics';

type MetricType = 'memory' | 'cpu' | 'requests' | 'responseTime' | 'eventLoop';

interface MetricConfig {
  key: MetricType;
  label: string;
  color: string;
  gradientId: string;
  icon: typeof Cpu;
  unit: string;
  getValue: (point: RealtimeMetricsPoint) => number;
  format: (value: number) => string;
}

const METRICS: MetricConfig[] = [
  {
    key: 'memory',
    label: 'Memory',
    color: '#8b5cf6',
    gradientId: 'memoryGradient',
    icon: HardDrive,
    unit: 'MB',
    getValue: (p) => p.memory.heapUsedMB,
    format: (v) => `${v.toFixed(1)} MB`,
  },
  {
    key: 'cpu',
    label: 'CPU',
    color: '#f59e0b',
    gradientId: 'cpuGradient',
    icon: Cpu,
    unit: '%',
    getValue: (p) => p.cpu.percentage,
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    key: 'requests',
    label: 'Req/s',
    color: '#10b981',
    gradientId: 'requestsGradient',
    icon: Activity,
    unit: '/s',
    getValue: (p) => p.requests.perSecond,
    format: (v) => `${v.toFixed(1)}/s`,
  },
  {
    key: 'responseTime',
    label: 'Latency',
    color: '#3b82f6',
    gradientId: 'responseTimeGradient',
    icon: Timer,
    unit: 'ms',
    getValue: (p) => p.requests.avgResponseTimeMs,
    format: (v) => `${v.toFixed(0)}ms`,
  },
  {
    key: 'eventLoop',
    label: 'Event Loop',
    color: '#ec4899',
    gradientId: 'eventLoopGradient',
    icon: Zap,
    unit: 'ms',
    getValue: (p) => p.eventLoop.lagMs,
    format: (v) => `${v.toFixed(2)}ms`,
  },
];

interface MetricTabProps {
  config: MetricConfig;
  isActive: boolean;
  onClick: () => void;
}

function MetricTab({ config, isActive, onClick }: MetricTabProps) {
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className="size-3.5" />
      <span>{config.label}</span>
      {isActive && (
        <motion.div
          layoutId="activeMetricTab"
          className="bg-foreground absolute inset-x-0 -bottom-px h-0.5"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: RealtimeMetricsPoint }>;
  activeMetric: MetricConfig;
}

function CustomTooltip({ active, payload, activeMetric }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload;
  const Icon = activeMetric.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-zinc-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/95"
    >
      <p className="mb-1 text-[10px] text-zinc-500 dark:text-zinc-400">
        {formatTime(point.timestamp)}
      </p>
      <div className="flex items-center gap-2">
        <Icon className="size-4" style={{ color: activeMetric.color }} />
        <span className="font-semibold" style={{ color: activeMetric.color }}>
          {activeMetric.format(activeMetric.getValue(point))}
        </span>
      </div>
    </motion.div>
  );
}

export function RealtimeMetricsChart() {
  const { data, isConnected, error, reconnect } = useRealtimeMetrics();
  const [activeMetric, setActiveMetric] = useState<MetricType>('memory');
  const [frozenData, setFrozenData] = useState<RealtimeMetricsPoint[] | null>(
    null
  );

  const handleMouseEnter = useCallback(() => {
    setFrozenData(data);
  }, [data]);

  const handleMouseLeave = useCallback(() => {
    setFrozenData(null);
  }, []);

  const isPaused = frozenData !== null;
  const displayData = frozenData ?? data;

  const metricConfig = useMemo(
    () => METRICS.find((m) => m.key === activeMetric)!,
    [activeMetric]
  );

  const chartData = useMemo(() => {
    return displayData.map((point) => ({
      ...point,
      value: metricConfig.getValue(point),
    }));
  }, [displayData, metricConfig]);

  const latestPoint = data[data.length - 1];
  const displayedLatestPoint = displayData[displayData.length - 1];

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    const max = Math.max(...chartData.map((d) => d.value));
    return Math.ceil(max * 1.2) || 100;
  }, [chartData]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const values = chartData.map((d) => d.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    };
  }, [chartData]);

  return (
    <div className="bg-card col-span-2 rounded-xl border p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={cn(
                'rounded-lg p-2',
                isConnected ? 'bg-emerald-500/10' : 'bg-rose-500/10'
              )}
            >
              {isConnected ? (
                <Wifi className="size-5 text-emerald-500" />
              ) : (
                <WifiOff className="size-5 text-rose-500" />
              )}
            </div>
            <AnimatePresence>
              {isConnected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex size-2.5"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Real-time Metrics</h3>
            <p className="text-muted-foreground text-xs">
              {isConnected ? (
                'Live system monitoring'
              ) : (
                <button
                  onClick={reconnect}
                  className="text-rose-500 hover:underline"
                >
                  {error?.message || 'Disconnected. Click to reconnect'}
                </button>
              )}
            </p>
          </div>
        </div>

        {latestPoint && (
          <div className="text-right">
            <p className="text-muted-foreground text-[10px]">Last update</p>
            <p className="font-mono text-xs tabular-nums">
              {formatTime(latestPoint.timestamp)}
            </p>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center border-b">
        {METRICS.map((metric) => (
          <MetricTab
            key={metric.key}
            config={metric}
            isActive={activeMetric === metric.key}
            onClick={() => setActiveMetric(metric.key)}
          />
        ))}
        <div className="ml-auto flex items-center gap-3 pb-1.5 text-xs">
          {isPaused && (
            <span className="flex items-center gap-1 text-amber-500">
              <Pause className="size-3" />
              Paused
            </span>
          )}
          {displayedLatestPoint && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">
                {metricConfig.label}:
              </span>
              <span className="font-semibold tabular-nums">
                {metricConfig.format(
                  metricConfig.getValue(displayedLatestPoint)
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        role="img"
        aria-label={`Real-time ${metricConfig.label} chart`}
        className="h-[280px]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              {METRICS.map((metric) => (
                <linearGradient
                  key={metric.gradientId}
                  id={metric.gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={metric.color}
                    stopOpacity={0.3}
                  />
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-zinc-200 dark:stroke-zinc-700"
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={50}
              className="text-zinc-500 dark:text-zinc-400"
            />
            <YAxis
              domain={[0, maxValue]}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v) =>
                `${v}${metricConfig.unit === '%' ? '%' : ''}`
              }
              className="text-zinc-500 dark:text-zinc-400"
            />
            <Tooltip
              content={<CustomTooltip activeMetric={metricConfig} />}
              cursor={{
                stroke: metricConfig.color,
                strokeWidth: 1,
                strokeDasharray: '5 5',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={metricConfig.color}
              strokeWidth={2}
              fill={`url(#${metricConfig.gradientId})`}
              isAnimationActive={false}
            />
            {displayedLatestPoint && (
              <ReferenceDot
                x={displayedLatestPoint.timestamp}
                y={metricConfig.getValue(displayedLatestPoint)}
                r={0}
                shape={(props) => {
                  const { cx, cy } = props as { cx: number; cy: number };
                  return (
                    <g>
                      {!isPaused && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill={metricConfig.color}
                          opacity={0.4}
                        >
                          <animate
                            attributeName="r"
                            from="4"
                            to="12"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            from="0.4"
                            to="0"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={metricConfig.color}
                        stroke="white"
                        strokeWidth={2}
                      />
                    </g>
                  );
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: metricConfig.color }}
            />
            <span className="text-muted-foreground">{metricConfig.label}</span>
          </div>
          {stats && (
            <div className="text-muted-foreground flex items-center gap-3">
              <span>
                Min:{' '}
                <span className="text-foreground tabular-nums">
                  {metricConfig.format(stats.min)}
                </span>
              </span>
              <span>
                Avg:{' '}
                <span className="text-foreground tabular-nums">
                  {metricConfig.format(stats.avg)}
                </span>
              </span>
              <span>
                Max:{' '}
                <span className="text-foreground tabular-nums">
                  {metricConfig.format(stats.max)}
                </span>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'size-2 rounded-full',
              isConnected ? 'bg-emerald-500' : 'bg-rose-500'
            )}
          />
          <span className="text-muted-foreground text-xs">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function RealtimeMetricsChartSkeleton() {
  return (
    <div className="bg-card col-span-2 rounded-xl border p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="ml-auto h-3 w-16" />
          <Skeleton className="ml-auto h-3 w-20" />
        </div>
      </div>
      <div className="mb-4 flex items-center gap-4 border-b pb-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-16" />
        ))}
      </div>
      <Skeleton className="h-[280px] w-full rounded-lg" />
      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
