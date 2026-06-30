export interface IStorageProvider {
  /**
   * Initialize the storage provider
   */
  initialize(): void;

  /**
   * Upload a file to the storage provider
   * @param bucketName Name of the storage bucket
   * @param fileName Name of the file to store
   * @param buffer File content buffer
   * @param mimeType MIME type of the file
   */
  upload(bucketName: string, fileName: string, buffer: Buffer, mimeType: string): Promise<string>;

  /**
   * Get the public URL for a file
   * @param bucketName Name of the storage bucket
   * @param fileName Name of the file
   */
  getPublicUrl(bucketName: string, fileName: string): string;
}
