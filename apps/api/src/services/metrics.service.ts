import type { RealtimeMetricsPoint } from '@repo/packages-types/stats';
import { cpus } from 'os';

const HISTORY_SIZE = 60;
const COLLECTION_INTERVAL_MS = 1000;

interface RequestMetric {
  timestamp: number;
  responseTimeMs: number;
  isError: boolean;
}

export class MetricsService {
  private history: RealtimeMetricsPoint[] = [];
  private requestMetrics: RequestMetric[] = [];
  private lastCpuUsage: NodeJS.CpuUsage | null = null;
  private lastCpuTime = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private subscribers = new Set<(metrics: RealtimeMetricsPoint) => void>();

  start() {
    if (this.intervalId) return;

    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuTime = Date.now();

    setTimeout(() => {
      this.collectMetrics();
      this.intervalId = setInterval(
        () => this.collectMetrics(),
        COLLECTION_INTERVAL_MS
      );
    }, COLLECTION_INTERVAL_MS);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  recordRequest(responseTimeMs: number, statusCode: number) {
    const now = Date.now();
    this.requestMetrics.push({
      timestamp: now,
      responseTimeMs,
      isError: statusCode >= 400,
    });

    const cutoff = now - 5000;
    this.requestMetrics = this.requestMetrics.filter(
      (m) => m.timestamp > cutoff
    );
  }

  subscribe(callback: (metrics: RealtimeMetricsPoint) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  getHistory(): RealtimeMetricsPoint[] {
    return [...this.history];
  }

  getLatest(): RealtimeMetricsPoint | null {
    return this.history[this.history.length - 1] ?? null;
  }

  private collectMetrics() {
    const now = Date.now();
    const memUsage = process.memoryUsage();

    const cpuPercentage = this.calculateCpuPercentage();

    const { rps, avgResponseTime, errorRate } =
      this.calculateRequestMetrics(now);

    const heapUsedMB =
      Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100;
    const heapTotalMB =
      Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100;
    const usedPercent =
      heapTotalMB > 0
        ? Math.round((heapUsedMB / heapTotalMB) * 100 * 100) / 100
        : 0;

    const metrics: RealtimeMetricsPoint = {
      timestamp: now,
      memory: {
        heapUsedMB,
        heapTotalMB,
        rssMB: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
        usedPercent,
      },
      cpu: {
        percentage: cpuPercentage,
      },
      errors: {
        rate: errorRate,
      },
      requests: {
        perSecond: rps,
        avgResponseTimeMs: avgResponseTime,
      },
    };

    this.history.push(metrics);
    if (this.history.length > HISTORY_SIZE) {
      this.history.shift();
    }

    this.subscribers.forEach((cb) => cb(metrics));
  }

  private calculateCpuPercentage(): number {
    if (!this.lastCpuUsage) {
      this.lastCpuUsage = process.cpuUsage();
      this.lastCpuTime = Date.now();
      return 0.01;
    }

    const currentCpuUsage = process.cpuUsage(this.lastCpuUsage);
    const currentTime = Date.now();
    const elapsedMs = currentTime - this.lastCpuTime;

    if (elapsedMs <= 0) {
      return 0.01;
    }

    const cpuCount = cpus().length;
    const totalMicroseconds = currentCpuUsage.user + currentCpuUsage.system;
    const percentage =
      ((totalMicroseconds / 1000 / elapsedMs) * 100) / cpuCount;

    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuTime = currentTime;

    const rounded = Math.round(Math.min(100, percentage) * 100) / 100;
    return Math.max(0.01, rounded);
  }

  private calculateRequestMetrics(now: number): {
    rps: number;
    avgResponseTime: number;
    errorRate: number;
  } {
    const windowMs = 5000;
    const cutoff = now - windowMs;
    const recentRequests = this.requestMetrics.filter(
      (m) => m.timestamp > cutoff
    );

    if (recentRequests.length === 0) {
      return { rps: 0, avgResponseTime: 0, errorRate: 0 };
    }

    const rps =
      Math.round((recentRequests.length / (windowMs / 1000)) * 100) / 100;
    const avgResponseTime =
      Math.round(
        (recentRequests.reduce((sum, m) => sum + m.responseTimeMs, 0) /
          recentRequests.length) *
          100
      ) / 100;

    const errorCount = recentRequests.filter((m) => m.isError).length;
    const errorRate =
      Math.round((errorCount / recentRequests.length) * 100 * 100) / 100;

    return { rps, avgResponseTime, errorRate };
  }
}

export const metricsService = new MetricsService();
