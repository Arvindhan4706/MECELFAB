"use client";
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CMSContext } from '../context/CMSContext';
import { ArrowLeft, Save, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

const AdminDashboard = () => {
  const { stats, projects, updateStats, addProject, editProject, deleteProject } = useContext(CMSContext);
  const router = useRouter();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('adminAuth') === 'true';
    }
    return false;
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Local state for statistics inputs
  const [statsInput, setStatsInput] = useState({
    projectsCompleted: stats.projectsCompleted,
    industrialClients: stats.industrialClients,
    serviceCategories: stats.serviceCategories,
    safetyCompliance: stats.safetyCompliance
  });

  // Local state for managing a project form (Add / Edit mode)
  const [editingId, setEditingId] = useState(null); // null means "Add New Project" mode
  const [projectForm, setProjectForm] = useState({
    title: '',
    category: 'Fabrication Works',
    description: '',
    status: 'Completed',
    client: '',
    year: '2026',
    image: '/images/project-fabrication.png'
  });

  const [notification, setNotification] = useState('');

  // Image Presets for easy selection
  const imagePresets = [
    { label: 'Fabrication Works', value: '/images/project-fabrication.png' },
    { label: 'Erection Works', value: '/images/project-erection.png' },
    { label: 'Electrical Works', value: '/images/project-electrical.png' },
    { label: 'Air Compressor Rental', value: '/images/project-compressor.png' },
    { label: 'Industrial Maintenance', value: '/images/project-maintenance.png' },
    { label: 'Commercial Infrastructure', value: '/images/project-commercial.png' },
  ];

  const handleStatsChange = (e) => {
    const { name, value } = e.target;
    setStatsInput((prev) => ({
      ...prev,
      [name]: parseInt(value, 10) || 0
    }));
  };

  const handleSaveStats = (e) => {
    e.preventDefault();
    updateStats(statsInput);
    triggerNotification('Statistics counters updated successfully!');
  };

  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    if (!projectForm.title.trim() || !projectForm.description.trim() || !projectForm.client.trim()) {
      triggerNotification('Please fill in all required project fields.');
      return;
    }

    if (editingId) {
      editProject(editingId, projectForm);
      triggerNotification('Project updated successfully!');
      setEditingId(null);
    } else {
      addProject(projectForm);
      triggerNotification('Project added successfully to portfolio!');
    }

    // Reset form
    setProjectForm({
      title: '',
      category: 'Fabrication Works',
      description: '',
      status: 'Completed',
      client: '',
      year: '2026',
      image: '/images/project-fabrication.png'
    });
  };

  const handleStartEdit = (proj) => {
    setEditingId(proj.id);
    setProjectForm({
      title: proj.title,
      category: proj.category,
      description: proj.description,
      status: proj.status,
      client: proj.client || '',
      year: proj.year || '2026',
      image: proj.image || '/images/project-fabrication.png'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project from the database?')) {
      deleteProject(id);
      triggerNotification('Project deleted successfully.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setProjectForm({
      title: '',
      category: 'Fabrication Works',
      description: '',
      status: 'Completed',
      client: '',
      year: '2026',
      image: '/images/project-fabrication.png'
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'MECELFAB123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#070B13',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: '#0F172A',
          padding: '3rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid rgba(255,255,255,0.05)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: 'var(--white)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Admin Login</h2>
          <p style={{ color: '#94A3B8', marginBottom: '2rem', fontSize: '0.9rem' }}>Please enter the password to access the CMS.</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="input-field"
              style={{ padding: '0.8rem', textAlign: 'center' }}
            />
            {authError && <div style={{ color: '#EF4444', fontSize: '0.85rem' }}>{authError}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Login
            </button>
          </form>
          
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              marginTop: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              fontSize: '0.9rem'
            }}
          >
            <ArrowLeft size={16} /> Back to Website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070B13', color: 'var(--white)', padding: '6rem 2rem 4rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '1rem' }}>
          <div>
            <button
              onClick={() => router.push('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                marginBottom: '1rem',
                padding: 0
              }}
            >
              <ArrowLeft size={16} /> Back to Website
            </button>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'var(--white)', letterSpacing: '-0.02em' }}>
              Content Management System
            </h1>
            <p style={{ color: '#94A3B8', marginTop: '0.5rem' }}>Manage website statistics and project portfolio.</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            Logout
          </button>
        </div>

        {/* Floating Notification Banner */}
        {notification && (
          <div
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--accent)',
              color: 'var(--white)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'left'
            }}
          >
            <CheckCircle2 size={18} style={{ color: 'var(--accent)' }} />
            <span>{notification}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'start' }} className="admin-grid">
          {/* Left Panel: Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* Statistics Counters Form */}
            <div className="admin-card">
              <h3 className="admin-title">Manage Statistics Counters</h3>
              <form onSubmit={handleSaveStats}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Projects Completed</label>
                    <input
                      type="number"
                      name="projectsCompleted"
                      value={statsInput.projectsCompleted}
                      onChange={handleStatsChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Industrial Clients</label>
                    <input
                      type="number"
                      name="industrialClients"
                      value={statsInput.industrialClients}
                      onChange={handleStatsChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Categories</label>
                    <input
                      type="number"
                      name="serviceCategories"
                      value={statsInput.serviceCategories}
                      onChange={handleStatsChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Safety Compliance (%)</label>
                    <input
                      type="number"
                      name="safetyCompliance"
                      value={statsInput.safetyCompliance}
                      onChange={handleStatsChange}
                      className="form-control"
                      max="100"
                      min="0"
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={16} />
                  Save Counters
                </button>
              </form>
            </div>

            {/* Portfolio Project Manager Form */}
            <div className="admin-card">
              <h3 className="admin-title">
                {editingId ? 'Edit Project Details' : 'Add New Portfolio Project'}
              </h3>
              <form onSubmit={handleProjectSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginBottom: '1.5rem' }} className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Project Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={projectForm.title}
                      onChange={handleProjectFormChange}
                      placeholder="e.g. Substation Terminal Setup"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Engineering Discipline *</label>
                    <select
                      name="category"
                      value={projectForm.category}
                      onChange={handleProjectFormChange}
                      className="form-control"
                    >
                      <option value="Fabrication Works">Fabrication Works</option>
                      <option value="Erection Works">Erection Works</option>
                      <option value="Electrical Works">Electrical Works</option>
                      <option value="Turbocharger Services">Turbocharger Services</option>
                      <option value="Industrial Maintenance">Industrial Maintenance</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginBottom: '1.5rem' }} className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">Client Name *</label>
                    <input
                      type="text"
                      name="client"
                      value={projectForm.client}
                      onChange={handleProjectFormChange}
                      placeholder="Client Enterprise Name"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Execution Year</label>
                    <input
                      type="text"
                      name="year"
                      value={projectForm.year}
                      onChange={handleProjectFormChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Project Status</label>
                    <select
                      name="status"
                      value={projectForm.status}
                      onChange={handleProjectFormChange}
                      className="form-control"
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Project Photo / Graphic Presets</label>
                  <select
                    name="image"
                    value={projectForm.image}
                    onChange={handleProjectFormChange}
                    className="form-control"
                  >
                    {imagePresets.map((preset, i) => (
                      <option key={i} value={preset.value}>
                        {preset.label} ({preset.value})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Project Scope Description *</label>
                  <textarea
                    name="description"
                    value={projectForm.description}
                    onChange={handleProjectFormChange}
                    placeholder="Provide a brief summary of structural fabrications, rigging, or equipment specifications..."
                    className="form-control"
                    style={{ minHeight: '100px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    {editingId ? <Save size={16} /> : <Plus size={16} />}
                    {editingId ? 'Update Project' : 'Add Project to Grid'}
                  </button>
                  
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn btn-secondary"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Panel: List of Projects */}
          <div className="admin-card" style={{ maxHeight: '800px', overflowY: 'auto' }}>
            <h3 className="admin-title">Live Portfolio Listings ({projects.length})</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #1E293B',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, color: 'var(--white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {proj.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{proj.category}</span>
                      <span>|</span>
                      <span>Client: {proj.client || 'N/A'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleStartEdit(proj)}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem', borderRadius: '4px' }}
                      title="Edit Project"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem', borderRadius: '4px', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)' }}
                      title="Delete Project"
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .form-row-2 {
            grid-template-columns: 1.2fr 0.8fr !important;
          }
          .form-row-3 {
            grid-template-columns: 1fr 0.5fr 0.5fr !important;
          }
        }
        @media (min-width: 992px) {
          .admin-grid {
            grid-template-columns: 1.2fr 0.8fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;

