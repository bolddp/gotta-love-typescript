// 1. Add provider and singleton
// 2. Add logger with optional chaining

export interface Provider<T> {
  get(): T;
}

// Showcasing the type as well
export type Logger = (msg: string) => void;

export class Singleton<T> implements Provider<T> {
  private instance?: T;

  private creator: () => T;
  private logger?: Logger;

  constructor(creator: () => T, logger?: (msg: string) => void) {
    this.creator = creator;
    this.logger = logger;
  }

  /**
   * Point out that this.instance first is T | undefined, but after the
   * if clause is added this.instance is only T
   */
  get(): T {
    if (!this.instance) {
      this.logger?.('Creating instance');
      this.instance = this.creator();
    }
    return this.instance;
  }
}
