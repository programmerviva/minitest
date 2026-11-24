import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/api';

// Fetch tasks for a project with optional filter and sort
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ projectId, status, sortBy, order }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (sortBy) params.append('sortBy', sortBy);
      if (order) params.append('order', order);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const data = await apiRequest(`/api/projects/${projectId}/tasks${queryString}`);
      return data.tasks;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Create task under a project
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ projectId, title, description, status, dueDate }, { rejectWithValue }) => {
    try {
      const data = await apiRequest(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        body: { title, description, status, dueDate },
      });
      return data.task;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update existing task
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, title, description, status, dueDate }, { rejectWithValue }) => {
    try {
      const data = await apiRequest(`/api/tasks/${id}`, {
        method: 'PUT',
        body: { title, description, status, dueDate },
      });
      return data.task;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  filterStatus: 'all', // 'all' | 'todo' | 'in-progress' | 'done'
  sortBy: 'createdAt', // 'createdAt' | 'dueDate'
  sortOrder: 'desc',   // 'asc' | 'desc'
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setSort: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.filterStatus = 'all';
      state.sortBy = 'createdAt';
      state.sortOrder = 'desc';
    },
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch tasks';
      });

    // Create task
    builder
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      });

    // Update task
    builder
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      });

    // Delete task
    builder
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      });
  },
});

export const { setFilterStatus, setSort, clearTasks, clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;
