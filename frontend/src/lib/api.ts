const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_BASE_URL = API_URL.replace('/api', '');

// Utility to construct full media URL
export const getMediaUrl = (mediaPath: string): string => {
  if (!mediaPath) return '';
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath;
  }
  return `${API_BASE_URL}${mediaPath}`;
};

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

    like: (token: string, entryId: string) =>
      apiFetch(`${API_URL}/entries/${entryId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }),

    unlike: (token: string, entryId: string) =>
      apiFetch(`${API_URL}/entries/${entryId}/like`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),

    addComment: (entryId: string, text: string, name?: string, token?: string, sessionToken?: string) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return apiFetch(`${API_URL}/entries/${entryId}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          text, 
          ...(name && { name }),
          ...(sessionToken && { sessionToken }),
        }),
      });
    },

    getComments: (entryId: string, token?: string, sessionToken?: string) => {
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const url = new URL(`${API_URL}/entries/${entryId}/comments`);
      if (sessionToken) {
        url.searchParams.append('sessionToken', sessionToken);
      }
      return apiFetch(url.toString(), { headers });
    },

    deleteComment: (entryId: string, commentId: string, token?: string, sessionToken?: string) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return apiFetch(`${API_URL}/entries/${entryId}/comments/${commentId}`, {
        method: 'DELETE',
        headers,
        body: sessionToken ? JSON.stringify({ sessionToken }) : undefined,
      });
    },
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

    uploadWithProgress: async (
      token: string,
      file: File,
      entryId: string | undefined,
      onProgress?: (percent: number) => void,
    ) => {
      const { default: axios } = await import('axios');
      const formData = new FormData();
      formData.append('file', file);
      if (entryId) formData.append('entryId', entryId);
      const res = await axios.post(`${API_URL}/media/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (evt: any) => {
          try {
            if (evt.total) {
              const percent = Math.round((evt.loaded / evt.total) * 100);
              onProgress?.(percent);
            }
          } catch {}
        },
      });
      return res.data;
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

  // Moderation endpoints
  moderation: {
    getPendingComments: (token: string) =>
      apiFetch(`${API_URL}/entries/moderation/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      }),

    getFlaggedComments: (token: string) =>
      apiFetch(`${API_URL}/entries/moderation/flagged`, {
        headers: { Authorization: `Bearer ${token}` },
      }),

    approveComment: (token: string, commentId: string) =>
      apiFetch(`${API_URL}/entries/moderation/${commentId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }),

    rejectComment: (token: string, commentId: string) =>
      apiFetch(`${API_URL}/entries/moderation/${commentId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },

  // Health check
  health: () =>
    apiFetch(`${API_URL.replace('/api', '')}/health`).catch(() => ({ 
      status: 'offline' 
    })),
};
