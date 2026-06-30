import { IStorageProvider } from './storage.interface';
import { SupabaseStorageProvider } from './providers/supabase.storage';
import { LocalStorageProvider } from './providers/local.storage';

export class StorageFactory {
  private static instance: IStorageProvider;

  public static getProvider(): IStorageProvider {
    if (!this.instance) {
      const providerType = process.env.STORAGE_PROVIDER?.toLowerCase() || 'supabase';

      switch (providerType) {
        case 'local':
          this.instance = new LocalStorageProvider();
          break;
        case 'supabase':
        default:
          this.instance = new SupabaseStorageProvider();
          break;
      }

      this.instance.initialize();
    }
    return this.instance;
  }
}
