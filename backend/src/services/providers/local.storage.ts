import { IStorageProvider } from '../storage.interface';
import * as fs from 'fs';
import * as path from 'path';

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
  }

  initialize(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    console.log(`LocalStorageProvider initialized. Uploads going to: ${this.uploadDir}`);
  }

  async upload(bucketName: string, fileName: string, buffer: Buffer, mimeType: string): Promise<string> {
    const bucketDir = path.join(this.uploadDir, bucketName);
    if (!fs.existsSync(bucketDir)) {
      fs.mkdirSync(bucketDir, { recursive: true });
    }

    const filePath = path.join(bucketDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return this.getPublicUrl(bucketName, fileName);
  }

  getPublicUrl(bucketName: string, fileName: string): string {
    // Requires a static route serving the /uploads directory (e.g. app.use('/uploads', express.static(...)))
    return `/uploads/${bucketName}/${fileName}`;
  }
}
