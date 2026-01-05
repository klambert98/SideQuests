const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public data: any,
    message: string = 'API Error'
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function apiFetch(url: string, options: RequestInit = {}): Promise<any> {
  try {
    const response = await fetch(url, options);

    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = typeof data === 'object' ? data?.error || data?.message : data;
      throw new APIError(
        response.status,
        data,
        errorMessage || `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(
      0,
      null,
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      apiFetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }),

    logout: (token: string) =>
      apiFetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }),

    getMe: (token: string) =>
      apiFetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }),

    updateMe: (token: string, data: any) =>
      apiFetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
  },

  // Entry endpoints
  entries: {
    getTimeline: () =>
      apiFetch(`${API_URL}/entries/timeline`),

    getByMonth: (year: number, month: number) =>
      apiFetch(`${API_URL}/entries/month/${year}/${month}`),

    getAll: (page: number = 1, limit: number = 10) =>
      apiFetch(`${API_URL}/entries?page=${page}&limit=${limit}`),

    getOne: (id: string) =>
      apiFetch(`${API_URL}/entries/${id}`),

    search: (query: string) =>
      apiFetch(`${API_URL}/entries/search/${encodeURIComponent(query)}`),

    create: (token: string, data: any) =>
      apiFetch(`${API_URL}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),

    update: (token: string, id: string, data: any) =>
      apiFetch(`${API_URL}/entries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),

    delete: (token: string, id: string) =>
      apiFetch(`${API_URL}/entries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },

  // Media endpoints
  media: {
    upload: (token: string, file: File, entryId?: string) => {
      const formData = new FormData();
      formData.append('file', file);
      if (entryId) formData.append('entryId', entryId);

      return apiFetch(`${API_URL}/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    },

    getByEntry: (entryId: string) =>
      apiFetch(`${API_URL}/media/entry/${entryId}`),

    delete: (token: string, id: string) =>
      apiFetch(`${API_URL}/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },

  // Embed endpoints
  embeds: {
    create: (token: string, data: any) =>
      apiFetch(`${API_URL}/embeds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),

    delete: (token: string, id: string) =>
      apiFetch(`${API_URL}/embeds/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },

  // Health check
  health: () =>
    apiFetch(`${API_URL.replace('/api', '')}/health`).catch(() => ({ 
      status: 'offline' 
    })),
};
