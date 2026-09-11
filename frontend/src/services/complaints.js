import { authFetch } from './api';

/**
 * Mengirimkan data keluhan (complaint) baru ke backend.
 * POST /api/Complaints
 * Payload: { regional, issueType, applicationId, categoryMasalah, usernameLDAP, role, description }
 */
export async function createComplaint(payload) {
    if (!payload.regional || !payload.issueType || !payload.applicationId || !payload.categoryMasalah || !payload.usernameLDAP || !payload.role || !payload.description) {
        throw new Error('Mohon lengkapi semua data wajib untuk mengajukan keluhan.');
    }

    return authFetch('/api/Complaints', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

/**
 * Mengambil semua keluhan dari backend.
 * GET /api/Complaints
 */
export async function fetchComplaints() {
    return authFetch('/api/Complaints');
}
