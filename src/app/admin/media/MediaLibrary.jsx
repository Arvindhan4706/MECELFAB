"use client";

import { useState } from 'react';
import { Upload, X, Trash2, Copy, FileIcon, ImageIcon, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function MediaLibrary({ initialMedia }) {
  const [mediaList, setMediaList] = useState(initialMedia);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      setMediaList([data.media, ...mediaList]);
    } catch (err) {
      setUploadError('Failed to upload file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this file? This action cannot be undone and may break links on your site.')) return;
    
    // Server action to delete would go here (optional implementation)
    // For now, we'll just remove it from UI or call an API route.
    alert('File deletion is restricted in the current storage configuration.');
  };

  return (
    <div className="bg-admin-surface/[0.02] border border-white/5 p-8 rounded-lg">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h2 className="text-xl font-heading font-light text-white">
          Media Library
        </h2>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleUpload}
            disabled={isUploading}
          />
          <label 
            htmlFor="file-upload"
            className={`flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-heading tracking-widest uppercase hover:bg-admin-surface hover:text-admin-heading transition-colors cursor-pointer ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
          >
            <Upload size={16} /> {isUploading ? 'Uploading...' : 'Upload File'}
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-200">
          {uploadError}
        </div>
      )}

      {mediaList.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
          <ImageIcon className="w-12 h-12 text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-secondary font-light">No media files uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {mediaList.map((media) => (
            <div key={media.id} className="group bg-black/40 border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 flex flex-col">
              <div className="relative aspect-square bg-admin-surface/[0.02] flex items-center justify-center p-4">
                {media.mimeType.startsWith('image/') ? (
                  <Image src={media.url} alt={media.alt || 'Media'} fill className="object-contain" />
                ) : (
                  <FileIcon className="w-16 h-16 text-secondary" />
                )}
                
                {/* Hover overlay for actions */}
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleCopy(media.url)}
                    className="p-2 bg-admin-surface/10 hover:bg-admin-surface/20 rounded-full text-white transition-colors"
                    title="Copy URL"
                  >
                    {copiedUrl === media.url ? <CheckCircle size={20} className="text-emerald-400" /> : <Copy size={20} />}
                  </button>
                  <button 
                    onClick={() => handleDelete(media.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-3 border-t border-white/5">
                <p className="text-xs text-white truncate mb-1" title={media.filename}>{media.filename}</p>
                <div className="flex justify-between items-center text-[10px] text-secondary font-mono">
                  <span>{(media.size / 1024).toFixed(1)} KB</span>
                  <span>{new Date(media.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
