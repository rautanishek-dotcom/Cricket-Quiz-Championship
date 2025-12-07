// Lightweight supabase-like shim that forwards calls to a custom REST API
// This keeps the frontend code mostly unchanged while replacing Supabase with a self-hosted API.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('app_token');
}

function saveToken(token: string) {
  localStorage.setItem('app_token', token);
}

function clearToken() {
  localStorage.removeItem('app_token');
}

// Simple auth wrapper
export const supabase = {
  auth: {
    async signUp({ email, password, options }: any) {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: options?.data?.name })
      });
      const json = await res.json();
      if (json?.data?.token) saveToken(json.data.token);
      return { data: json.data || null, error: json.error || null };
    },

    async signInWithPassword({ email, password }: any) {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (json?.data?.token) saveToken(json.data.token);
      return { data: json.data || null, error: json.error || null };
    },

    async signOut() {
      clearToken();
      return { data: null, error: null };
    },

    async getSession() {
      const token = getToken();
      if (!token) return { data: { session: null } };
      const res = await fetch(`${API_URL}/auth/session`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    },

    onAuthStateChange(cb: any) {
      // Minimal implementation: return an unsub function. We call this on sign in/out manually in shim.
      const sub = { callback: cb };
      return { data: { subscription: sub } };
    }
  },

  // Query builder shim: supports .from(table).select(...).limit(n).order(field, {ascending:false}).insert/update/delete/eq
  from(table: string) {
    const state: any = { table };

    const builder: any = {
      select(cols?: string) {
        state.op = 'select';
        state.cols = cols || '*';
        return builder;
      },
      limit(n: number) {
        state.limit = n;
        return builder;
      },
      order(field: string, opts?: any) {
        const dir = opts?.ascending ? 'asc' : 'desc';
        state.order = `${field}.${dir}`;
        return builder;
      },
      update(payload: any) {
        state.op = 'update';
        state.payload = payload;
        return builder;
      },
      insert(payload: any) {
        state.op = 'insert';
        state.payload = payload;
        return execute(state);
      },
      delete() {
        state.op = 'delete';
        return builder;
      },
      eq(field: string, value: any) {
        state.filter = { field, value };
        return execute(state);
      },
      // make the builder awaitable
      then(resolve: any, reject: any) {
        execute(state).then(resolve).catch(reject);
      }
    };

    async function execute(s: any) {
      const token = getToken();
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      try {
        if (s.op === 'select') {
          const params = new URLSearchParams();
          if (s.limit) params.set('limit', String(s.limit));
          if (s.order) params.set('order', s.order);
          const res = await fetch(`${API_URL}/${s.table}?${params.toString()}`, { headers });
          const json = await res.json();
          return { data: json.data, error: json.error || null };
        }

        if (s.op === 'insert') {
          const res = await fetch(`${API_URL}/${s.table}`, {
            method: 'POST', headers, body: JSON.stringify(s.payload)
          });
          const json = await res.json();
          return { data: json.data || null, error: json.error || null };
        }

        if (s.op === 'update') {
          // use filter if present
          if (!s.filter) throw new Error('No filter specified for update');
          const id = s.filter.value;
          const res = await fetch(`${API_URL}/${s.table}/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(s.payload)
          });
          const json = await res.json();
          return { data: json.data || null, error: json.error || null };
        }

        if (s.op === 'delete') {
          if (!s.filter) throw new Error('No filter specified for delete');
          const id = s.filter.value;
          const res = await fetch(`${API_URL}/${s.table}/${id}`, { method: 'DELETE', headers });
          const json = await res.json();
          return { data: json.data || null, error: json.error || null };
        }

        return { data: null, error: 'Unsupported operation' };
      } catch (err) {
        return { data: null, error: err };
      }
    }

    return builder;
  }
};
