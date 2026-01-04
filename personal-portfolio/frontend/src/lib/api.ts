const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).then(r => r.json()),

    logout: (token: string) =>
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),

    getMe: (token: string) =>
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),

    updateMe: (token: string, data: any) =>
      fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then(r => r.json()),
  },

  // Entry endpoints
  entries: {
    getTimeline: () =>
      fetch(`${API_URL}/entries/timeline`).then(r => r.json()),

    getByMonth: (year: number, month: number) =>
      fetch(`${API_URL}/entries/month/${year}/${month}`).then(r => r.json()),

    getAll: (page: number = 1, limit: number = 10) =>
      fetch(`${API_URL}/entries?page=${page}&limit=${limit}`).then(r => r.json()),

    getOne: (id: string) =>
      fetch(`${API_URL}/entries/${id}`).then(r => r.json()),

    search: (query: string) =>
      fetch(`${API_URL}/entries/search/${encodeURIComponent(query)}`).then(r => r.json()),

    create: (token: string, data: any) =>
      fetch(`${API_URL}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then(r => r.json()),

    update: (token: string, id: string, data: any) =>
      fetch(`${API_URL}/entries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then(r => r.json()),

    delete: (token: string, id: string) =>
      fetch(`${API_URL}/entries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
  },

  // Media endpoints
  media: {
    upload: (token: string, file: File, entryId?: string) => {
      const formData = new FormData();
      formData.append('file', file);
      if (entryId) formData.append('entryId', entryId);

      return fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }).then(r => r.json());
    },

    getByEntry: (entryId: string) =>
      fetch(`${API_URL}/media/entry/${entryId}`).then(r => r.json()),

    delete: (token: string, id: string) =>
      fetch(`${API_URL}/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
  },

  // Embed endpoints
  embeds: {
    create: (token: string, data: any) =>
      fetch(`${API_URL}/embeds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then(r => r.json()),

    delete: (token: string, id: string) =>
      fetch(`${API_URL}/embeds/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
  },
};
