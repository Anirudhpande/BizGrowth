import { useState } from 'react';
import { api } from '../utils/api';

export default function ImageUpload({ onUploadSuccess, onUploadError, defaultPreview = '' }) {
  const [preview, setPreview] = useState(defaultPreview);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;

    // Validate type (images only)
    if (!file.type.startsWith('image/')) {
      const errMsg = 'Invalid file type. Please upload an image.';
      if (onUploadError) onUploadError(errMsg);
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      const errMsg = 'File size is too large. Maximum size is 5MB.';
      if (onUploadError) onUploadError(errMsg);
      return;
    }

    setUploading(true);

    // 1. Read file as base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Data = reader.result;
      setPreview(base64Data);

      // Create a unique file name
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      try {
        // 2. Upload to backend upload API
        const res = await api.post('/api/upload', {
          file: base64Data,
          fileName,
          bucketName: 'bizgrowth-assets'
        });

        if (res && res.success && res.url) {
          if (onUploadSuccess) onUploadSuccess(res.url);
        } else {
          throw new Error(res?.message || 'Upload failed.');
        }
      } catch (err) {
        console.error('File upload error:', err);
        const errMsg = err.message || 'Failed to upload image.';
        if (onUploadError) onUploadError(errMsg);
      } finally {
        setUploading(false);
      }
    };
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center min-h-[160px] ${
        dragActive 
          ? 'border-secondary bg-secondary/5' 
          : 'border-outline-variant/60 bg-surface-container-low hover:border-secondary hover:bg-surface-container-high'
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {uploading ? (
        <div className="space-y-3">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-body-sm text-on-surface-variant font-bold">Uploading assets to cloud...</p>
        </div>
      ) : preview ? (
        <div className="space-y-4 w-full">
          <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto border border-outline-variant/30 shadow-sm bg-surface">
            <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2 justify-center">
            <label className="bg-secondary text-white hover:bg-secondary/90 px-4 py-1.5 rounded-full font-bold text-body-sm transition-all cursor-pointer shadow-sm">
              Change Image
              <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
            </label>
            <button 
              type="button" 
              onClick={() => { setPreview(''); if (onUploadSuccess) onUploadSuccess(''); }}
              className="border border-error text-error hover:bg-error/10 px-4 py-1.5 rounded-full font-bold text-body-sm transition-all"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <span className="material-symbols-outlined text-[44px] text-on-surface-variant/40">cloud_upload</span>
          <div className="text-body-sm text-on-surface-variant">
            <label className="text-secondary font-bold hover:underline cursor-pointer">
              Upload a file
              <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
            </label>
            <span> or drag & drop</span>
          </div>
          <p className="text-[11px] text-on-surface-variant/50">PNG, JPG, or WEBP up to 5MB</p>
        </div>
      )}
    </div>
  );
}
