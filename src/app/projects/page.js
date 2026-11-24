'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchProjects, createProject, updateProject, deleteProject } from '@/store/projectSlice';

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state) => state.projects);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    if (editingProject) {
      const res = await dispatch(updateProject({ id: editingProject._id, title, description }));
      if (res.error) {
        setFormError(res.payload || 'Failed to update project');
      } else {
        closeModal();
      }
    } else {
      const res = await dispatch(createProject({ title, description }));
      if (res.error) {
        setFormError(res.payload || 'Failed to create project');
      } else {
        closeModal();
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async (id, projectTitle) => {
    if (confirm(`Are you sure you want to delete "${projectTitle}" and all its tasks?`)) {
      await dispatch(deleteProject(id));
    }
  };

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Projects</h1>
            <p className="page-subtitle">Manage your project workspaces and tasks</p>
          </div>
          <button onClick={openCreateModal} className="btn btn-primary">
            + New Project
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading && projects.length === 0 ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p style={{ marginBottom: '1.25rem' }}>Create your first project to start organizing tasks.</p>
            <button onClick={openCreateModal} className="btn btn-primary">
              Create Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project._id} className="project-card">
                <div>
                  <div className="project-card-header">
                    <Link href={`/projects/${project._id}`} className="project-card-title">
                      {project.title}
                    </Link>
                  </div>
                  <p className="project-card-description">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="project-card-footer">
                  <span>
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <div className="card-actions">
                    <Link href={`/projects/${project._id}`} className="btn btn-outline btn-sm">
                      View Tasks
                    </Link>
                    <button
                      onClick={() => openEditModal(project)}
                      className="btn btn-outline btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project._id, project.title)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingProject ? 'Edit Project' : 'Create Project'}
                </h2>
                <button onClick={closeModal} className="modal-close">
                  &times;
                </button>
              </div>

              {formError && <div className="error-banner">{formError}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="project-title">
                    Project Title *
                  </label>
                  <input
                    id="project-title"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Website Redesign"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="project-description">
                    Description
                  </label>
                  <textarea
                    id="project-description"
                    className="form-textarea"
                    placeholder="Brief description of the project..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={closeModal} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
