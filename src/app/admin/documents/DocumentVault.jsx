"use client";

import { useState } from 'react';
import { Upload, X, Trash2, FileText, Download, CheckCircle, Shield } from 'lucide-react';

export default function DocumentVault({ initialDocuments }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrivate', 'true');
    formData.append('category', 'GENERAL');

    try {
      const res = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      setDocuments([data.document, ...documents]);
    } catch (err) {
      setUploadError('Document upload is restricted in the current storage configuration.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return;
    alert('Document deletion is restricted in the current storage configuration.');
  };

  return (
    <div className="bg-admin-surface/[0.02] border border-white/5 p-8 rounded-lg">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-heading font-light text-white flex items-center gap-2">
            <Shield size={20} className="text-accent" /> Document Vault
          </h2>
          <p className="text-secondary text-sm mt-1">Private storage for NDAs, compliance certificates, and client files.</p>
        </div>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleUpload}
            disabled={isUploading}
          />
          <label 
            htmlFor="file-upload"
            className={`flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-heading tracking-widest uppercase hover:bg-admin-surface hover:text-admin-heading transition-colors cursor-pointer ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
          >
            <Upload size={16} /> {isUploading ? 'Uploading...' : 'Upload Secure File'}
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-200">
          {uploadError}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
          <Shield className="w-12 h-12 text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-secondary font-light">No documents secured yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-secondary text-xs uppercase tracking-widest font-heading">
                <th className="pb-4 font-normal">Document</th>
                <th className="pb-4 font-normal">Category</th>
                <th className="pb-4 font-normal">Size</th>
                <th className="pb-4 font-normal">Date</th>
                <th className="pb-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-white/5 hover:bg-admin-surface/[0.02] transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-admin-surface/5 flex items-center justify-center border border-white/10">
                        <FileText size={18} className="text-accent" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{doc.filename}</div>
                        {doc.inquiry && (
                          <div className="text-xs text-secondary mt-1">Client: {doc.inquiry.name}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-secondary">
                    <span className="px-2 py-1 bg-admin-surface/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest font-heading">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-secondary">
                    {(doc.size / 1024).toFixed(1)} KB
                  </td>
                  <td className="py-4 text-sm text-secondary">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-secondary hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-heading"
                      >
                        <Download size={14} /> Download
                      </a>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-heading ml-4"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
