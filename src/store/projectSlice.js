import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/api';

// Fetch all projects for user
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiRequest('/api/projects');
      return data.projects;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch single project by id
export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await apiRequest(`/api/projects/${id}`);
      return data.project;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Create a new project
export const createProject = createAsyncThunk(
  'projects/createProject',
  async ({ title, description }, { rejectWithValue }) => {
    try {
      const data = await apiRequest('/api/projects', {
        method: 'POST',
        body: { title, description },
      });
      return data.project;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update existing project
export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, title, description }, { rejectWithValue }) => {
    try {
      const data = await apiRequest(`/api/projects/${id}`, {
        method: 'PUT',
        body: { title, description },
      });
      return data.project;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Delete project
export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest(`/api/projects/${id}`, { method: 'DELETE' });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch projects';
      });

    // Fetch single project
    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch project';
      });

    // Create project
    builder
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      });

    // Update project
    builder
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      });

    // Delete project
    builder
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p._id !== action.payload);
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }
      });
  },
});

export const { clearCurrentProject, clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
