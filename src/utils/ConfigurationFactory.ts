import AWS from 'aws-sdk';
import { AsyncSingleton } from './AsyncProvider';
import { LogInterface } from './Log';

/**
 *
 * Creates a generic configuration factory. The factory needs to be configured with
 * a ConfigurationProvider that indicates how each configuration value should be retrieved,
 * e.g. from environment variables, SSM Parameter store or a fixed value.
 * ```ts
 * // Declare the configuration interface
 * export interface AppConfiguration {
 *   configValue: string;
 *   nestedData: {
 *     anotherValue: string;
 *     booleanValue: boolean;
 *     numericValue: number;
 *   }
 * }
 *
 * // Create a type for your specific configuration provider that can be injected into consuming classes
 * export type AppConfigurationProvider = ConfigurationProvider<AppConfiguration>;
 *
 * // Construct the factory and use the builder to indicate how each configuration value should be resolved
 * export const appConfigurationFactory = new ConfigurationFactory<AppConfiguration>({
 *   builder: provider => ({
 *     // Will be picked up from process.env.ENV_VARIABLE (if it exists) or the default value
 *     configValue: provider.env('ENV_VARIABLE', 'defaultValue'),
 *     nestedData: {
 *       // Will be fetched from AWS SSM Parameter store
 *       anotherValue: provider.ssm('/ssm/dev/PARAMETER_KEY'),
 *       booleanValue: provider.envAsBoolean('BOOLEAN_VALUE', false),
 *       numericValue: provider.ssmAsNumber('/ssm/dev/NUMERIC_VALUE')
 *     }
 *   })
 * })
 *
 * // Usage
 * export class MyService {
 *   private config: AppConfigurationProvider;
 *   constructor(config: AppConfigurationProvider) {
 *     this.config = config;
 *   }
 *
 *   async someMethod(): Promise<void> {
 *     // Pretty neat, use the strictly typed configuration provider to read values as you need them
 *     const anotherValue = await this.config.nestedData.anotherValue();
 *   }
 * }
 *
 * // Inject the configuration provider by calling .get() on the factory
 * export const myServiceFactory = new Singleton<MyService>(() => new MyService(appConfigurationFactory.get()));
 * ```
 *
 */
export class ConfigurationFactory<TConfiguration> {
  private factoryConfig: ConfigurationFactoryConfig<TConfiguration>;
  private provider: ConfigurationProvider<TConfiguration>;
  private context: ConfigurationFactoryContext;

  constructor(factoryConfig: ConfigurationFactoryConfig<TConfiguration>) {
    this.factoryConfig = factoryConfig;
    this.context = { ssmValues: {} };
    this.provider = factoryConfig.builder({
      env: (variableName, defaultValue) => {
        const provider = new EnvValueProvider(this.factoryConfig.log, variableName);
        return provider.get(defaultValue);
      },
      envAsNumber: (variableName, defaultValue) => {
        const provider = new EnvValueProvider(this.factoryConfig.log, variableName);
        return provider.getAsNumber(defaultValue);
      },
      envAsBoolean: (variableName, defaultValue) => {
        const provider = new EnvValueProvider(this.factoryConfig.log, variableName);
        return provider.getAsBoolean(defaultValue);
      },
      fixed: (value) => {
        const provider = new FixedValueProvider(this.factoryConfig.log, value);
        return provider.get();
      },
      ssm: (parameterKey, defaultValue) => {
        const provider = new SsmValueProvider(
          this.factoryConfig.log,
          () => this.contextFactory.get(),
          parameterKey
        );
        provider.addParameterKeyToContext(this.context);
        return provider.get(defaultValue);
      },
      ssmAsNumber: (parameterKey, defaultValue) => {
        const provider = new SsmValueProvider(
          this.factoryConfig.log,
          () => this.contextFactory.get(),
          parameterKey
        );
        provider.addParameterKeyToContext(this.context);
        return provider.getAsNumber(defaultValue);
      },
      ssmAsBoolean: (parameterKey, defaultValue) => {
        const provider = new SsmValueProvider(
          this.factoryConfig.log,
          () => this.contextFactory.get(),
          parameterKey
        );
        provider.addParameterKeyToContext(this.context);
        return provider.getAsBoolean(defaultValue);
      },
    });
  }

  /**
   * Constructing the context is an async singleton, since we only want one call to SSM
   * to be made. If multiple configuration values that depend on SSM are queried in parallel,
   * the requests will not be resolved until the first context construction has completed.
   */
  private contextFactory = new AsyncSingleton<ConfigurationFactoryContext>(async () => {
    this.factoryConfig.log?.DEBUG('creating factory context');
    await this.getSsmParameterValues(this.context);
    return this.context;
  });

  /**
   * Get the provider for your configuration interface.
   */
  get(): ConfigurationProvider<TConfiguration> {
    return this.provider;
  }

  /**
   * Loads and returns the whole configuration.
   */
  async getConfiguration(): Promise<TConfiguration> {
    const apply = async (obj: any) => {
      const result: any = {};
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] == 'function') {
          result[key] = await obj[key]();
        } else {
          result[key] = await apply(obj[key]);
        }
      }
      return result;
    };
    return apply(this.provider);
  }

  private async getSsmParameterValues(ctx: ConfigurationFactoryContext): Promise<void> {
    const keys = Object.keys(ctx.ssmValues);
    const ts = Date.now();
    const ssm = this.factoryConfig.ssmConfig?.awsSsmClientProvider?.() ?? new AWS.SSM();
    const parameterKeys = keys.map((key) => this.buildSsmKey(this.factoryConfig.ssmConfig, key));
    const rsp = await ssm
      .getParameters({
        Names: parameterKeys,
        WithDecryption: true,
      })
      .promise();
    this.factoryConfig.log?.DEBUG(
      `queried parameter keys ${JSON.stringify(parameterKeys)}, found ${JSON.stringify(
        (rsp.Parameters ?? []).map((p) => p.Name)
      )}, duration: ${Date.now() - ts}ms`
    );
    for (const param of rsp.Parameters ?? []) {
      const key = keys.find((key) => param.Name!.endsWith(key));
      if (key) {
        ctx.ssmValues[key] = param.Value;
      }
    }
  }

  private buildSsmKey(ssmConfig: SsmParameterStoreConfig | undefined, parameterKey: string) {
    if (parameterKey.startsWith('/')) {
      parameterKey = parameterKey.slice(1);
    }

    // Pick out the segments that are defined in the configuration
    const prefixSegments = [
      ssmConfig?.system,
      ssmConfig?.envType,
      ssmConfig?.serviceName,
      parameterKey,
    ].filter((s) => s);
    return `/${prefixSegments.join('/')}`;
  }
}

export interface ConfigurationFactoryConfig<TConfiguration> {
  /**
   * Builder for the ConfigurationProvider for the application. Use the built-in
   * provider factories to construct ConfigurationValueProviders,
   * e.g. provider.env('ENVIRONMENT_VARUABLE')
   */
  builder: (provider: ConfigurationValueProviderFactories) => ConfigurationProvider<TConfiguration>;
  /**
   * The configuration for SSM Parameter store. If this is not set, the full key path will have to
   * be provided, and there may be issues with the AWS SSM client not being properly configured
   */
  ssmConfig?: SsmParameterStoreConfig;
  log?: LogInterface;
}

/**
 * Represents a builder of a generic configuration interface that also supports
 * nesting values.
 */
export type ConfigurationProvider<TConfiguration> = {
  [TKey in keyof TConfiguration]: TConfiguration[TKey] extends string | number | boolean
    ? ConfigurationValueProvider<TConfiguration[TKey]>
    : ConfigurationProvider<TConfiguration[TKey]>;
};

type ConfigurationValueProvider<T extends string | number | boolean = string> = () => Promise<T>;

/**
 * Holds data that is used during the retrieval of the configuration, e.g.
 * the list of values that should be retrieved from SSM Parameter store with
 * a single call etc.
 */
interface ConfigurationFactoryContext {
  ssmValues: { [key: string]: string | undefined };
}

type ConfigurationFactoryContextFactory = () => Promise<ConfigurationFactoryContext>;

/**
 * Constructs a configuration value provider that reads its value from an environment variable
 * or the provided default value.
 */
class EnvValueProvider {
  private log: LogInterface | undefined;
  private variableName: string;
  private value?: string;

  constructor(log: LogInterface | undefined, variableName: string) {
    this.log = log;
    this.variableName = variableName;
  }

  get(defaultValue?: string): ConfigurationValueProvider<string> {
    return async () => {
      if (this.value) {
        return this.value;
      }
      this.value = process.env[this.variableName];
      if (!this.value) {
        if (!defaultValue) {
          throw new Error(
            `Could not get process.env.${this.variableName}, and no default value was provided`
          );
        }
        this.log?.DEBUG(
          `couldn't find process.env.${this.variableName}, using default value: ${defaultValue}`
        );
        this.value = defaultValue;
      } else {
        // The retrieved value will be output once to the log, the value shouldn't be sensitive
        // if it's stored in an env.variable
        this.log?.DEBUG(`getting process.env.${this.variableName}: ${this.value}`);
      }
      return this.value;
    };
  }

  getAsNumber(defaultValue?: number): ConfigurationValueProvider<number> {
    return async () => {
      const stringValue = await this.get(
        defaultValue != undefined ? defaultValue.toString() : undefined
      )();
      const value = parseFloat(stringValue);
      if (Number.isNaN(value)) {
        if (!defaultValue) {
          throw new Error(
            `Could not convert process.env.${this.variableName} to a number (found "${stringValue}"), and no default value was provided`
          );
        }
        return defaultValue;
      }
      return value;
    };
  }

  getAsBoolean(defaultValue?: boolean): ConfigurationValueProvider<boolean> {
    return async () => {
      const stringValue = await this.get(
        defaultValue != undefined ? defaultValue.toString() : undefined
      )();
      const isValid = ['true', 'false', '1', '0'].includes(stringValue.toLowerCase());
      if (!isValid) {
        if (defaultValue == undefined) {
          throw new Error(
            `Could not convert process.env.${this.variableName} to a boolean (found "${stringValue}"), and no default value was provided`
          );
        }
        return defaultValue;
      }
      return ['true', '1'].includes(stringValue.toLowerCase());
    };
  }
}

/**
 * Constructs a configuration value provider that provides a fixed value.
 */
class FixedValueProvider<T extends string | number | boolean = string> {
  private log: LogInterface | undefined;
  private value: T;

  constructor(log: LogInterface | undefined, value: T) {
    this.log = log;
    this.value = value;
  }

  get(): ConfigurationValueProvider<T> {
    return async () => {
      this.log?.DEBUG(`getting fixed value: ${this.value}`);
      return this.value;
    };
  }
}

/**
 * Constructs a configuration value provider that reads its value from
 * AWS SSM Parameter store.
 */
class SsmValueProvider {
  private log: LogInterface | undefined;
  private ctxProviderFactory: ConfigurationFactoryContextFactory;
  private parameterKey: string;
  private value?: string;

  constructor(
    log: LogInterface | undefined,
    ctxProviderFactory: ConfigurationFactoryContextFactory,
    parameterKey: string
  ) {
    this.log = log;
    this.ctxProviderFactory = ctxProviderFactory;
    this.parameterKey = parameterKey;
  }

  async addParameterKeyToContext(ctx: ConfigurationFactoryContext) {
    ctx.ssmValues[this.parameterKey] = undefined;
  }

  get(defaultValue?: string): ConfigurationValueProvider<string> {
    return async () => {
      if (this.value) {
        return this.value;
      }
      const ctx = await this.ctxProviderFactory();
      this.value = ctx.ssmValues[this.parameterKey];
      if (!this.value) {
        if (!defaultValue) {
          throw new Error(
            `Could not get SSM Parameter store value ${this.parameterKey}, and no default value was provided`
          );
        }
        this.value = defaultValue;
        // Only logging the length of the retrieved value, since it may be sensitive
        this.log?.DEBUG(
          `couldn't find SSM Parameter store value ${this.parameterKey}, using default value: ${this.value.length} characters`
        );
      } else {
        this.log?.DEBUG(
          `got SSM Parameter store value ${this.parameterKey}: ${this.value.length} characters`
        );
      }
      return this.value;
    };
  }

  getAsNumber(defaultValue?: number): ConfigurationValueProvider<number> {
    return async () => {
      const stringValue = await this.get(
        defaultValue != undefined ? defaultValue.toString() : undefined
      )();
      const value = parseFloat(stringValue);
      if (Number.isNaN(value)) {
        if (!defaultValue) {
          throw new Error(
            `Could not convert SSM Parameter store value ${this.parameterKey} to a number, and no default value was provided`
          );
        }
        return defaultValue;
      }
      return value;
    };
  }

  getAsBoolean(defaultValue?: boolean): ConfigurationValueProvider<boolean> {
    return async () => {
      const stringValue = await this.get(
        defaultValue != undefined ? defaultValue.toString() : undefined
      )();
      const isValid = ['true', 'false', '1', '0'].includes(stringValue.toLowerCase());
      if (!isValid) {
        if (defaultValue == undefined) {
          throw new Error(
            `Could not convert SSM Parameter store value ${this.parameterKey} to a boolean, and no default value was provided`
          );
        }
        return defaultValue;
      }
      return ['true', '1'].includes(stringValue.toLowerCase());
    };
  }
}

interface ConfigurationValueProviderFactories {
  /**
   * Provides a configuration value from AWS SSM Parameter store. If the value cannot be found,
   * the default value is used. If no default value is provided, an exception is thrown.
   */
  ssm: (parameterKey: string, defaultValue?: string) => ConfigurationValueProvider;
  /**
   * Provides a configuration value from AWS SSM Parameter store and converts it to a number. If the conversion
   * fails, the default value is used. If no default value is provided, an exception is thrown.
   */
  ssmAsNumber: (parameterKey: string, defaultValue?: number) => ConfigurationValueProvider<number>;
  /**
   * Provides a configuration value from AWS SSM Parameter store and converts it to a boolean. Valid input values
   * are 'true', 'false', '1', '0' (case insensitive). If the conversion fails, the default value is used. If no
   * default value is provided, an exception is thrown.
   */
  ssmAsBoolean: (
    parameterKey: string,
    defaultValue?: boolean
  ) => ConfigurationValueProvider<boolean>;
  /**
   * Fetches a configuration value from env.variables, e.g. process.env.VARIABLE_NAME. If the value cannot be found,
   * the default value is used. If no default value is provided, an exception is thrown.
   */
  env: (variableName: string, defaultValue?: string) => ConfigurationValueProvider<string>;
  /**
   * Fetches a configuration value from env.variables and converts it to a number. If the conversion fails,
   * the default value is used. If there is no default value, an exception is thrown.
   */
  envAsNumber: (variableName: string, defaultValue?: number) => ConfigurationValueProvider<number>;
  /**
   * Fetches a configuration value from env.variables and converts it to a boolean. Valid input values
   * are 'true', 'false', '1', '0' (case insensitive). If the conversion fails, the default value is used.
   * If there is no default value provided, an exception is thrown.
   */
  envAsBoolean: (
    variableName: string,
    defaultValue?: boolean
  ) => ConfigurationValueProvider<boolean>;
  /**
   * Provides a fixed configuration value that can be accessed the same way as other configuration values.
   */
  fixed: <T extends string | number | boolean = string>(value: T) => ConfigurationValueProvider<T>;
}

export interface SsmParameterStoreConfig {
  system?: string;
  serviceName?: string;
  envType?: string;
  /**
   * Provider for the AWS SSM client to use to make queries for SSM Parameter store values.
   * If the configuration factory is declared as global constant, it may be initialized before
   * the AWS SDK has been properly configured. This is especially true when trying to run the
   * application locally.
   */
  awsSsmClientProvider?: () => AWS.SSM;
}
