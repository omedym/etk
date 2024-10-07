import { IRepositoryPostgresServiceOptions } from './postgres.options';

const { DATABASE_URL_POSTGRES = '', ASSET_BUCKET = '' } = process.env;

export const configurePostgresModule = (
  options?: IRepositoryPostgresServiceOptions
): IRepositoryPostgresServiceOptions => {
  return {
    databaseUrl: DATABASE_URL_POSTGRES,
    assetBucket: ASSET_BUCKET,
    ...options,
  };
};
