export interface ServiceConfig {
  log?: (msg: string) => void;
}

export class Service {
  private config?: ServiceConfig;

  constructor(config?: ServiceConfig) {
    this.config = config;
  }

  doSomething() {
    this.config?.log?.("doing something");
    console.log("Important work");
  }
}
