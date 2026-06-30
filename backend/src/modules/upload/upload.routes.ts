import { Router, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { AuthenticatedRequest } from '../../types';
import { StorageFactory } from '../../services/storage.factory';

const router = Router();

/**
 * POST /api/upload
 * Accept base64 encoded image and upload to storage provider.
 */
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { file, fileName, bucketName = 'bizgrowth-assets' } = req.body;

    if (!file || !fileName) {
      res.status(400).json({ success: false, message: 'Missing file (base64) or fileName.' });
      return;
    }

    // 1. Extract mime type and clean base64 data
    const matches = file.match(/^data:(.+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let base64Content = file;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Content = matches[2];
    }

    const buffer = Buffer.from(base64Content, 'base64');

    // 2. Upload using Storage Provider
    const storageProvider = StorageFactory.getProvider();
    
    let publicUrl: string;
    try {
      publicUrl = await storageProvider.upload(bucketName, fileName, buffer, mimeType);
    } catch (error) {
      console.error('Storage upload error:', error);
      res.status(500).json({ success: false, message: `Storage upload failed: ${(error as Error).message}` });
      return;
    }

    res.status(200).json({
      success: true,
      url: publicUrl,
      message: 'File uploaded successfully.'
    });
  } catch (error) {
    console.error('Upload catch block error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
