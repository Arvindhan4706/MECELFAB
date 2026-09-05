"use client";

import { useState } from 'react';
import { Plus, Trash2, X, AlertCircle } from 'lucide-react';
import { createClient, deleteClient } from '@/app/actions/admin';
import Image from 'next/image';

export default function ClientList({ initialClients }) {
  const [clients, setClients] = useState(initialClients);
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
      await createClient(formData);
      // Optimistic
      setClients([{ 
        id: Date.now().toString(), 
        name: formData.get('name'), 
        logo: formData.get('logo'), 
        sector: formData.get('sector') 
      }, ...clients]);
      handleCloseModal();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
        setClients(clients.filter(c => c.id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-heading font-light text-white mb-2">Clients</h2>
          <p className="text-secondary text-sm">Manage the trusted partners and client logos displayed on the homepage.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-heading tracking-widest uppercase"
        >
          <Plus size={16} />
          Add Client
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-admin-surface/[0.02] border border-white/5 rounded-xl p-6 flex flex-col items-center text-center group">
            <div className="relative w-32 h-20 mb-4 opacity-70 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {(client.logoUrl || client.logo) ? (
                <Image
                  src={client.logoUrl || client.logo}
                  alt={client.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-secondary/60 border border-dashed border-white/10 rounded">
                  No Logo
                </div>
              )}
            </div>
            <h3 className="text-white font-medium mb-1">{client.name}</h3>
            <p className="text-xs text-secondary mb-4 uppercase tracking-widest">{client.sector || 'General'}</p>
            <button
              onClick={() => handleDelete(client.id)}
              className="mt-auto px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors text-xs font-heading tracking-widest uppercase flex items-center gap-2"
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="p-12 text-center text-secondary bg-admin-surface/[0.02] border border-white/5 rounded-xl">
          No clients found. Add one to get started.
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h3 className="text-xl font-heading font-light text-white">Add New Client</h3>
              <button
                onClick={handleCloseModal}
                className="text-secondary hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-heading tracking-widest text-secondary uppercase mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-heading tracking-widest text-secondary uppercase mb-2">
                    Logo Image URL *
                  </label>
                  <input
                    type="text"
                    name="logo"
                    required
                    placeholder="Use Media Library to upload and paste URL here"
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-heading tracking-widest text-secondary uppercase mb-2">
                    Industry Sector
                  </label>
                  <input
                    type="text"
                    name="sector"
                    placeholder="e.g. Manufacturing, Power, Auto"
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent transition-colors text-sm"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-4 bg-admin-surface/[0.02]">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2 border border-white/10 text-white rounded-lg hover:bg-admin-surface/5 transition-colors text-sm font-heading tracking-widest uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="client-form"
                disabled={loading}
                className="px-6 py-2 bg-admin-surface text-admin-heading rounded-lg hover:bg-gray-200 transition-colors text-sm font-heading tracking-widest uppercase disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
