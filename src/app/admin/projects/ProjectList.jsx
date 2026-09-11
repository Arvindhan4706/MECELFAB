"use client";

import { useState } from 'react';
import { Plus, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { createProject, updateProject, deleteProject } from '@/app/actions/admin';
import Image from 'next/image';

export default function ProjectList({ initialProjects }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Erection',
    status: 'Completed',
    client: '',
    year: new Date().getFullYear().toString(),
    description: '',
    image: '',
  });

  const categories = ['Erection', 'Fabrication', 'Hydraulic & Pneumatic', 'Generator Services', 'AMC', 'Rental', 'Turbocharger'];
  const statuses = ['Completed', 'In Progress', 'DRAFT'];

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        slug: project.slug,
        category: project.category,
        status: project.status,
        client: project.client || '',
        year: project.year || '',
        description: project.description,
        image: project.image || '',
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        slug: '',
        category: 'Erection',
        status: 'Completed',
        client: '',
        year: new Date().getFullYear().toString(),
        description: '',
        image: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from title if we're not editing
      ...(name === 'title' && !editingProject && { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });

    try {
      if (editingProject) {
        await updateProject(editingProject.id, formDataObj);
        setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...formData } : p));
      } else {
        await createProject(formDataObj);
        // We trigger a hard refresh or update local state. For simplicity, we just reload the page to get the new list with IDs.
        window.location.reload();
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert('Failed to save project. Ensure you are an Admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        setProjects(projects.filter(p => p.id !== id));
      } catch {
        alert('Failed to delete project.');
      }
    }
  };

  return (
    <div className="bg-admin-surface/[0.02] border border-white/5 p-8 rounded-lg">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h2 className="text-xl font-heading font-light text-white">
          All Projects
        </h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-heading tracking-widest uppercase hover:bg-admin-surface hover:text-admin-heading transition-colors"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      <div className="overflow-x-hidden md:overflow-x-auto">
        <table className="w-full text-left border-collapse block md:table">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-white/10 text-secondary text-xs uppercase tracking-widest font-heading">
              <th className="pb-4 font-normal">Project</th>
              <th className="pb-4 font-normal">Category</th>
              <th className="pb-4 font-normal">Client</th>
              <th className="pb-4 font-normal">Status</th>
              <th className="pb-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {projects.map((project) => (
              <tr key={project.id} className="block md:table-row border-b border-white/5 hover:bg-admin-surface/[0.02] transition-colors mb-6 md:mb-0 pb-4 md:pb-0">
                <td className="block md:table-cell py-2 md:py-4">
                  <div className="flex items-center gap-4 mb-2 md:mb-0">
                    <div className="w-12 h-12 rounded bg-admin-surface/5 flex items-center justify-center overflow-hidden border border-white/10 relative flex-shrink-0">
                      {project.image ? (
                        <Image src={project.image} alt={project.title} fill className="object-cover" />
                      ) : (
                        <ImageIcon size={20} className="text-secondary" />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">{project.title}</div>
                      <div className="text-xs text-secondary">{project.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="block md:table-cell py-1 md:py-4 text-sm text-secondary">
                  <span className="md:hidden font-heading text-xs uppercase tracking-widest text-white/40 mr-2">Category:</span>
                  {project.category}
                </td>
                <td className="block md:table-cell py-1 md:py-4 text-sm text-secondary">
                  <span className="md:hidden font-heading text-xs uppercase tracking-widest text-white/40 mr-2">Client:</span>
                  {project.client}
                </td>
                <td className="block md:table-cell py-2 md:py-4">
                  <span className="md:hidden font-heading text-xs uppercase tracking-widest text-white/40 mr-2">Status:</span>
                  <span className={`inline-block text-xs px-2 py-1 rounded ${
                    project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    project.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                    'bg-admin-elevated0/10 text-gray-400 border border-gray-500/20'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="block md:table-cell py-3 md:py-4 text-left md:text-right mt-2 md:mt-0 border-t border-white/5 md:border-0">
                  <div className="flex items-center justify-start md:justify-end gap-4">
                    <button onClick={() => handleOpenModal(project)} className="text-secondary hover:text-white transition-colors flex items-center gap-2 text-sm uppercase tracking-widest font-heading">
                      <Edit size={16} /> <span className="md:hidden">Edit</span>
                    </button>
                    <button onClick={() => handleDelete(project.id)} className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 text-sm uppercase tracking-widest font-heading">
                      <Trash2 size={16} /> <span className="md:hidden">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr className="block md:table-row">
                <td colSpan="5" className="block md:table-cell py-8 text-center text-secondary italic">
                  No projects found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-[#111] z-10">
              <h3 className="text-xl font-heading text-white">
                {editingProject ? 'Edit Project' : 'Create Project'}
              </h3>
              <button onClick={handleCloseModal} className="text-secondary hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-heading tracking-widest text-secondary uppercase mb-2">Title</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:border-accent outline-none" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-heading tracking-widest text-secondary uppercase mb-2">Slug</label>
                  <input type="text" name="slug" required value={formData.slug} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:border-accent outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-heading tracking-widest text-secondary uppercase mb-2">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:border-accent outline-none">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-heading tracking-widest text-secondary uppercase mb-2">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:border-accent outline-none">
                    {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-heading tracking-widest text-secondary uppercase mb-2">Client</label>
                  <input type="text" name="client" value={formData.client} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:border-accent outline-none" />
                </div>
                
                <div>
                  <label className="block text-xs font-heading tracking-widest text-secondary uppercase mb-2">Year</label>
                  <input type="text" name="year" value={formData.year} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:border-accent outline-none" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-heading tracking-widest text-secondary uppercase mb-2">Description</label>
                  <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:border-accent outline-none"></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-heading tracking-widest text-secondary uppercase mb-2">Feature Image URL</label>
                  <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="/uploads/example.png" className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:border-accent outline-none" />
                  <p className="text-xs text-secondary mt-2">Enter an image URL or use the Media Library to upload one.</p>
                </div>
              </div>

              <div className="flex justify-between gap-4 pt-4 border-t border-white/10 mt-6">
                <div>
                  {editingProject && (
                    <a
                      href={`/projects/${editingProject.slug}?preview=true`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-admin-surface/5 transition-colors inline-block text-sm font-heading tracking-widest uppercase"
                    >
                      Preview
                    </a>
                  )}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={handleCloseModal} className="px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-admin-surface/5 transition-colors text-sm font-heading tracking-widest uppercase">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:bg-admin-surface hover:text-admin-heading transition-colors disabled:opacity-50 text-sm font-heading tracking-widest uppercase">
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
