import { ConfigurationFactory, ConfigurationProvider } from '../utils/ConfigurationFactory';

export interface AppConfiguration {
  db: {
    url: string;
    user: string;
    password: string;
  };
}

export type AppConfigurationProvider = ConfigurationProvider<AppConfiguration>;

export const appConfigurationFactory = new ConfigurationFactory<AppConfiguration>({
  builder: (provider) => ({
    db: {
      url: provider.env('DB_URL'),
      user: provider.env('DB_USER'),
      password: provider.ssm('DB_PASSWORD'),
    },
  }),
});
