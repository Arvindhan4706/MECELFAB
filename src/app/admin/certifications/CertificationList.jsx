"use client";

import { useState } from 'react';
import { Plus, Trash2, Award, CheckCircle, XCircle, X } from 'lucide-react';
import { createCertification, deleteCertification } from '@/app/actions/admin';

export default function CertificationList({ initialCertifications }) {
  const [certifications, setCertifications] = useState(initialCertifications);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenModal = () => {
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);

    try {
      await createCertification(formData);
      setCertifications([{
        id: Date.now().toString(),
        title: formData.get('title'),
        issuer: formData.get('issuer'),
        year: formData.get('year'),
        featured: formData.get('featured') === 'true',
        image: formData.get('image'),
        fileUrl: formData.get('fileUrl')
      }, ...certifications]);
      handleCloseModal();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this certification?')) {
      try {
        await deleteCertification(id);
        setCertifications(certifications.filter(c => c.id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-admin-heading">Certifications</h1>
          <p className="text-admin-muted text-sm mt-1">Manage ISO and industry compliance certifications.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Certification
        </button>
      </div>

      <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border overflow-hidden">
        {certifications.length === 0 ? (
          <div className="p-8 text-center text-admin-muted">No certifications found. Add your compliance documents.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-admin-elevated border-b border-admin-border">
                <th className="py-3 px-6 text-xs font-semibold text-admin-muted uppercase tracking-wider">Certification</th>
                <th className="py-3 px-6 text-xs font-semibold text-admin-muted uppercase tracking-wider">Issuer</th>
                <th className="py-3 px-6 text-xs font-semibold text-admin-muted uppercase tracking-wider">Year</th>
                <th className="py-3 px-6 text-xs font-semibold text-admin-muted uppercase tracking-wider">Featured</th>
                <th className="py-3 px-6 text-xs font-semibold text-admin-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border/50">
              {certifications.map(cert => (
                <tr key={cert.id} className="hover:bg-admin-elevated transition-colors">
                  <td className="py-4 px-6 font-medium text-admin-heading flex items-center gap-3">
                    <Award size={18} className="text-blue-500" />
                    {cert.title}
                  </td>
                  <td className="py-4 px-6 text-sm text-admin-muted">{cert.issuer}</td>
                  <td className="py-4 px-6 text-sm text-admin-muted">{cert.year || 'N/A'}</td>
                  <td className="py-4 px-6">
                    {cert.featured ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <XCircle size={18} className="text-gray-300" />
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDelete(cert.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Delete certification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-admin-surface border border-admin-border rounded-xl w-full max-w-md p-6 relative">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-admin-muted hover:text-admin-heading"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-admin-heading mb-4">Add Compliance Certification</h3>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-admin-muted mb-1">Certification Name</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="e.g. ISO 9001:2015"
                  className="w-full bg-admin-elevated border border-admin-border rounded p-2 text-sm text-admin-heading focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-admin-muted mb-1">Issuing Authority</label>
                <input 
                  type="text" 
                  name="issuer" 
                  required 
                  placeholder="e.g. Bureau Veritas / TUV"
                  className="w-full bg-admin-elevated border border-admin-border rounded p-2 text-sm text-admin-heading focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-admin-muted mb-1">Year / Valid Until</label>
                <input 
                  type="text" 
                  name="year" 
                  placeholder="e.g. 2026"
                  className="w-full bg-admin-elevated border border-admin-border rounded p-2 text-sm text-admin-heading focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" name="featured" id="certFeatured" value="true" className="rounded" />
                <label htmlFor="certFeatured" className="text-sm text-admin-heading">Feature in Trust / Regulatory sections</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-admin-border">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-admin-border text-admin-muted rounded hover:text-admin-heading text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                >
                  {loading ? 'Saving...' : 'Save Certification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
