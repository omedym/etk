import { Vault, VaultState } from '@omedym/nestjs-dmq-repository-postgres-client';

export { VaultState, Vault };

export type VaultToCreate = Omit<Vault, 'createdAt' | 'updatedAt' | 'state'>;
