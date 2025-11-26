export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(
  date: Date | string,
  includeYear = false
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(includeYear && { year: 'numeric' }),
  });
}

export function getRelativeTime(
  date: Date | string,
  options: { short?: boolean; alwaysShowTime?: boolean } = {}
): string {
  const { short = false, alwaysShowTime = false } = options;
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) {
    return alwaysShowTime ? (short ? '1m ago' : '1 minute ago') : 'just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return short ? `${minutes}m ago` : `${minutes} minutes ago`;
  }

  const hours = Math.floor(seconds / 3600);
  if (hours < 24) {
    return short ? `${hours}h ago` : `${hours} hours ago`;
  }

  const days = Math.floor(seconds / 86400);
  if (days < 7) {
    return short ? `${days}d ago` : `${days} days ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return short ? `${weeks}w ago` : `${weeks} weeks ago`;
  }

  return formatDate(d);
}

export function formatTime(date: Date | string | number): string {
  const d =
    typeof date === 'number'
      ? new Date(date)
      : typeof date === 'string'
        ? new Date(date)
        : date;
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
