import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

const STORAGE_KEY = 'container.auth';

export interface AuthUser {
  username: string;
}

interface StoredAuth {
  token: string;
  user: AuthUser;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

// Read any previously persisted session synchronously, at module load, so
// the very first render already knows whether the user is authenticated -
// without this, RequireAuth would flash a redirect to /login on every page
// refresh before the "real" state loads.
function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    // Corrupt/foreign value under this key (or localStorage unavailable,
    // e.g. private browsing) - treat as logged out rather than throwing.
    return null;
  }
}

const stored = readStoredAuth();

const initialState: AuthState = {
  token: stored?.token ?? null,
  user: stored?.user ?? null,
  status: 'idle',
  error: null,
};

export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Skeleton-only mock: this base project has no real auth backend. Swap the
 * body of this thunk for a real call (e.g. `axios.post('/auth/login', ...)`,
 * axios is already a dependency) - RequireAuth, the persisted session, and
 * `useAuth()` all stay the same regardless of what's inside here.
 */
export const login = createAsyncThunk<StoredAuth, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!username.trim() || !password.trim()) {
      return rejectWithValue('Username and password are required.');
    }
    return { token: `demo-token-${Date.now()}`, user: { username } };
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<StoredAuth>) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Login failed.';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
