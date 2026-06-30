import { IStorageProvider } from '../storage.interface';
import { supabase } from '../../config/supabase';

export class SupabaseStorageProvider implements IStorageProvider {
  initialize(): void {
    console.log('SupabaseStorageProvider initialized.');
  }

  async upload(bucketName: string, fileName: string, buffer: Buffer, mimeType: string): Promise<string> {
    const { error } = await supabase.storage.from(bucketName).upload(fileName, buffer, {
      contentType: mimeType,
      upsert: true
    });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    return this.getPublicUrl(bucketName, fileName);
  }

  getPublicUrl(bucketName: string, fileName: string): string {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    return data.publicUrl;
  }
}
