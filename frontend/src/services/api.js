const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5010';

export async function login(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || 'Login gagal. Coba lagi.');
    }

    return data;
}

export async function authFetch(path, options = {}) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || `Request gagal (${response.status})`);
    }

    return response.json();
}

export async function appRegistration(payload) {
    return authFetch('/api/Applications', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}