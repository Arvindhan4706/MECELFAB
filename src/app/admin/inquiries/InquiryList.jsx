"use client";

import { useState } from 'react';
import { Mail, Phone, Trash2, CheckCircle, Clock } from 'lucide-react';
import { updateInquiryStatus, deleteInquiry } from '@/app/actions/admin';

export default function InquiryList({ initialInquiries }) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateInquiryStatus(id, newStatus);
      setInquiries(inquiries.map(inq => 
        inq.id === id ? { ...inq, status: newStatus } : inq
      ));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await deleteInquiry(id);
        setInquiries(inquiries.filter(inq => inq.id !== id));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-medium">NEW</span>;
      case 'READ':
        return <span className="px-2 py-1 bg-admin-elevated0/10 text-gray-400 border border-gray-500/20 rounded text-xs font-medium">READ</span>;
      case 'RESPONDED':
        return <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs font-medium">RESPONDED</span>;
      default:
        return <span className="px-2 py-1 bg-admin-elevated0/10 text-gray-400 border border-gray-500/20 rounded text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-8rem)]">
      {/* Inbox List */}
      <div className="w-1/3 flex flex-col bg-admin-surface/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-admin-surface/5">
          <h2 className="text-lg font-heading font-light text-white">Inbox ({inquiries.filter(i => i.status === 'NEW').length} New)</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {inquiries.length === 0 ? (
            <div className="p-8 text-center text-secondary text-sm">No inquiries found.</div>
          ) : (
            inquiries.map((inq) => (
              <div 
                key={inq.id}
                onClick={() => {
                  setSelectedInquiry(inq);
                  if (inq.status === 'NEW') handleStatusChange(inq.id, 'READ');
                }}
                className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
                  selectedInquiry?.id === inq.id ? 'bg-admin-surface/10' : 'hover:bg-admin-surface/[0.04]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-white truncate pr-2">{inq.name}</div>
                  {getStatusBadge(inq.status)}
                </div>
                <div className="text-sm text-secondary truncate">{inq.company || inq.email}</div>
                <div className="text-xs text-secondary/70 mt-2 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(inq.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inquiry Detail */}
      <div className="w-2/3 bg-admin-surface/[0.02] border border-white/5 rounded-xl overflow-hidden flex flex-col">
        {selectedInquiry ? (
          <>
            <div className="p-6 border-b border-white/5 flex justify-between items-start bg-admin-surface/5">
              <div>
                <h2 className="text-2xl font-heading font-light text-white mb-2">{selectedInquiry.name}</h2>
                <div className="flex items-center gap-4 text-sm text-secondary">
                  <span className="flex items-center gap-1"><Mail size={14} /> {selectedInquiry.email}</span>
                  {selectedInquiry.phone && <span className="flex items-center gap-1"><Phone size={14} /> {selectedInquiry.phone}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange(selectedInquiry.id, 'RESPONDED')}
                  disabled={selectedInquiry.status === 'RESPONDED'}
                  className="p-2 text-secondary hover:text-green-400 hover:bg-green-400/10 rounded transition-colors disabled:opacity-50"
                  title="Mark as Responded"
                >
                  <CheckCircle size={18} />
                </button>
                <button
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="p-2 text-secondary hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                  title="Delete Inquiry"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                  <div className="text-xs font-heading tracking-widest text-secondary uppercase mb-1">Company</div>
                  <div className="text-white">{selectedInquiry.company || 'N/A'}</div>
                </div>
                <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                  <div className="text-xs font-heading tracking-widest text-secondary uppercase mb-1">Service Required</div>
                  <div className="text-white">{selectedInquiry.service || 'N/A'}</div>
                </div>
              </div>
              
              <div className="mb-2 text-xs font-heading tracking-widest text-secondary uppercase">Message</div>
              <div className="p-6 bg-black/40 rounded-lg border border-white/5 text-white/90 leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-secondary">
                <span>Inquiry ID: {selectedInquiry.id}</span>
                <span>Received: {new Date(selectedInquiry.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-secondary p-8">
            <Mail size={48} className="mb-4 opacity-20" />
            <p>Select an inquiry to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
