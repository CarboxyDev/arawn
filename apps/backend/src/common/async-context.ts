import { AsyncLocalStorage } from 'node:async_hooks';

interface AsyncContext {
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

export class AsyncContextService {
  private static storage = new AsyncLocalStorage<AsyncContext>();

  static run<T>(context: AsyncContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  static getStore(): AsyncContext | undefined {
    return this.storage.getStore();
  }

  static get(key: keyof AsyncContext): unknown {
    const store = this.storage.getStore();
    return store?.[key];
  }

  static set(key: keyof AsyncContext, value: unknown): void {
    const store = this.storage.getStore();
    if (store) {
      store[key] = value;
    }
  }

  static getRequestId(): string | undefined {
    return this.get('requestId') as string | undefined;
  }
}
