## Mapped types

```ts
export interface AppConfiguration {
  dbUrl: string;
  dbUser: string;
  dbPassword: string;
}
```

### Hardcoded, incl. sensitive values (ouch)

```ts
export const appConfig: AppConfiguration = {
  dbUrl: 'theUrl',
  dbUser: 'theUser',
  dbPassword: 'dbPassword',
};

// The strings should be fetched from somewhere, we want something like this

export interface AppConfigurationProvider {
  dbUrl: () => string;
  dbUser: () => string;
  dbPassword: () => string;
}
```

### Mapped types to the rescue

the properties of one type or interface determines the properties of another

```ts
export type ConfigurationProvider<TConfiguration> = {
  [TKey in keyof TConfiguration]: ConfigurationValueProvider<string>;
};

type ConfigurationValueProvider<T extends string | number | boolean = string> = () => Promise<T>;

export const elegantAppConfig: ConfigurationProvider<AppConfiguration> = {
  dbUrl: async () => getFromEnv('DB_URL'),
  dbUser: async () => 'db_user', // <-- Fixed value
  dbPassword: async () => getFromParameterStore('DB_PASSWORD'),
};
```

### Let's get nested

```ts
export type NestedConfigurationProvider<TConfiguration> = {
  [TKey in keyof TConfiguration]: TConfiguration[TKey] extends string | number | boolean
    ? ConfigurationValueProvider<TConfiguration[TKey]>
    : NestedConfigurationProvider<TConfiguration[TKey]>;
};
```

Update AppConfiguration to have a `db: { ... }` around the original properties
