'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchProjectById } from '@/store/projectSlice';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  setFilterStatus,
  setSort,
} from '@/store/taskSlice';

export default function ProjectTasksPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const projectId = params.id;

  const { currentProject, loading: projectLoading } = useSelector((state) => state.projects);
  const { tasks, loading: tasksLoading, error: taskError, filterStatus, sortBy, sortOrder } =
    useSelector((state) => state.tasks);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch project details and tasks
  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
      dispatch(
        fetchTasks({
          projectId,
          status: filterStatus,
          sortBy,
          order: sortOrder,
        })
      );
    }
  }, [dispatch, projectId, filterStatus, sortBy, sortOrder]);

  const handleStatusFilterChange = (newStatus) => {
    dispatch(setFilterStatus(newStatus));
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === 'due-asc') {
      dispatch(setSort({ sortBy: 'dueDate', order: 'asc' }));
    } else if (val === 'due-desc') {
      dispatch(setSort({ sortBy: 'dueDate', order: 'desc' }));
    } else if (val === 'created-desc') {
      dispatch(setSort({ sortBy: 'createdAt', order: 'desc' }));
    } else if (val === 'created-asc') {
      dispatch(setSort({ sortBy: 'createdAt', order: 'asc' }));
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('todo');
    setDueDate('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status || 'todo');
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('todo');
    setDueDate('');
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

    if (editingTask) {
      const res = await dispatch(
        updateTask({
          id: editingTask._id,
          title,
          description,
          status,
          dueDate: dueDate || null,
        })
      );
      if (res.error) {
        setFormError(res.payload || 'Failed to update task');
      } else {
        closeModal();
      }
    } else {
      const res = await dispatch(
        createTask({
          projectId,
          title,
          description,
          status,
          dueDate: dueDate || null,
        })
      );
      if (res.error) {
        setFormError(res.payload || 'Failed to create task');
      } else {
        closeModal();
      }
    }
    setSubmitting(false);
  };

  const handleQuickStatusChange = async (task, newStatus) => {
    await dispatch(
      updateTask({
        id: task._id,
        status: newStatus,
      })
    );
  };

  const handleDelete = async (id, taskTitle) => {
    if (confirm(`Are you sure you want to delete task "${taskTitle}"?`)) {
      await dispatch(deleteTask(id));
    }
  };

  const formatDueBadge = (dateString) => {
    if (!dateString) return null;
    const due = new Date(dateString);
    return `Due: ${due.toLocaleDateString()}`;
  };

  return (
    <ProtectedRoute>
      <div className="container">
        {/* Navigation & Project Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link href="/projects" className="nav-link" style={{ fontSize: '0.9rem' }}>
            &larr; Back to Projects
          </Link>
        </div>

        <div className="page-header">
          <div>
            <h1 className="page-title">
              {projectLoading && !currentProject ? 'Loading project...' : currentProject?.title || 'Project'}
            </h1>
            <p className="page-subtitle">
              {currentProject?.description || 'No description provided.'}
            </p>
          </div>
          <button onClick={openCreateModal} className="btn btn-primary">
            + New Task
          </button>
        </div>

        {/* Controls: Filter & Sort */}
        <div className="controls-bar">
          <div className="control-group">
            <span className="control-label">Filter Status:</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['all', 'todo', 'in-progress', 'done'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusFilterChange(st)}
                  className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-outline'}`}
                >
                  {st === 'all'
                    ? 'All'
                    : st === 'todo'
                    ? 'To Do'
                    : st === 'in-progress'
                    ? 'In Progress'
                    : 'Done'}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">Sort By:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}
              value={
                sortBy === 'dueDate'
                  ? sortOrder === 'asc'
                    ? 'due-asc'
                    : 'due-desc'
                  : sortOrder === 'asc'
                  ? 'created-asc'
                  : 'created-desc'
              }
              onChange={handleSortChange}
            >
              <option value="due-asc">Due Date (Soonest first)</option>
              <option value="due-desc">Due Date (Latest first)</option>
              <option value="created-desc">Created Date (Newest first)</option>
              <option value="created-asc">Created Date (Oldest first)</option>
            </select>
          </div>
        </div>

        {taskError && <div className="error-banner">{taskError}</div>}

        {/* Tasks List */}
        {tasksLoading && tasks.length === 0 ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p style={{ marginBottom: '1.25rem' }}>
              {filterStatus !== 'all'
                ? `No tasks with status "${filterStatus}". Try another filter.`
                : 'Create your first task for this project.'}
            </p>
            <button onClick={openCreateModal} className="btn btn-primary">
              Create Task
            </button>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map((task) => (
              <div key={task._id} className="task-card">
                <div className="task-main">
                  <div className="task-header">
                    <span className={`badge badge-${task.status}`}>
                      {task.status}
                    </span>
                    <h3 className="task-title">{task.title}</h3>
                  </div>

                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}

                  <div className="task-meta">
                    {task.dueDate && <span>📅 {formatDueBadge(task.dueDate)}</span>}
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="task-side">
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                    value={task.status}
                    onChange={(e) => handleQuickStatusChange(task, e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>

                  <button
                    onClick={() => openEditModal(task)}
                    className="btn btn-outline btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task._id, task.title)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Task Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingTask ? 'Edit Task' : 'Create Task'}
                </h2>
                <button onClick={closeModal} className="modal-close">
                  &times;
                </button>
              </div>

              {formError && <div className="error-banner">{formError}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="task-title">
                    Title *
                  </label>
                  <input
                    id="task-title"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Design Landing Page"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-description">
                    Description
                  </label>
                  <textarea
                    id="task-description"
                    className="form-textarea"
                    placeholder="Details about this task..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-status">
                    Status
                  </label>
                  <select
                    id="task-status"
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-due">
                    Due Date
                  </label>
                  <input
                    id="task-due"
                    type="date"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={closeModal} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
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
