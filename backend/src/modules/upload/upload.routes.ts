import { Router, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { AuthenticatedRequest } from '../../types';
import { supabase } from '../../config/supabase';

const router = Router();

/**
 * POST /api/upload
 * Accept base64 encoded image and upload to Supabase storage.
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

    // 2. Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      // If bucket does not exist, it might fail. In sandboxed local environment,
      // return a simulated fallback URL or bubble the error.
      console.error('Supabase storage upload error:', error);
      res.status(500).json({ success: false, message: `Storage upload failed: ${error.message}` });
      return;
    }

    // 3. Retrieve public URL
    const { data: urlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);

    res.status(200).json({
      success: true,
      url: urlData.publicUrl,
      message: 'File uploaded successfully.'
    });
  } catch (error) {
    console.error('Upload catch block error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
