export interface AppConfiguration {
  dbUrl: string;
  dbUser: string;
  dbPassword: string;
}

export const connectToDatabase = (config: AppConfiguration) => {};
