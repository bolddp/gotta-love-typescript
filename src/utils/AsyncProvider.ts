/**
 * Provider of strongly-typed instances. Implementing classes decides whether it should be a
 * per request, singleton etc.
 */
export interface AsyncProvider<T> {
  get(): Promise<T>;
}

/**
 * An instance getter that provides a new instance on each request.
 */
export class AsyncPerRequest<T> implements AsyncProvider<T> {
  private creator: () => Promise<T>;

  constructor(creator: () => Promise<T>) {
    this.creator = creator;
  }

  get(): Promise<T> {
    return this.creator();
  }
}

/**
 * Manages an async operation that should only be performed once, e.g. constructing an API
 * or something similar. If the get() method is invoked by several callers during the operation,
 * all but the first call is queued up until the instance has resolved.
 */
export class AsyncSingleton<T> implements AsyncProvider<T> {
  private isGetting = false;
  private instance?: T;
  private error?: Error;
  private getter: () => Promise<T>;
  private queue: {
    res: (instance: T) => void;
    rej: (error: Error) => void;
  }[] = [];

  constructor(getter: () => Promise<T>) {
    this.getter = getter;
  }

  async get(): Promise<T> {
    if (!this.instance && !this.error) {
      if (!this.isGetting) {
        this.isGetting = true;
        try {
          this.instance = await this.getter();
          // Resolve all queued promises
          this.queue.forEach((q) => q.res(this.instance!));
          return this.instance;
        } catch (error: any) {
          this.error = error;
          // Reject all queued promises
          this.queue.forEach((q) => q.rej(error));
          throw error;
        }
      } else {
        return new Promise<T>((resolve, reject) => {
          this.queue.push({
            res: (i) => resolve(i),
            rej: (e) => reject(e),
          });
        });
      }
    } else {
      if (this.error) {
        throw this.error;
      }
      return this.instance!;
    }
  }
}
