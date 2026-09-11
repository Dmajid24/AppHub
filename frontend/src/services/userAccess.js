import { authFetch } from './api';

/**
 * Mengambil semua whitelist aktif milik user tertentu.
 * GET /api/UserAccess/{userId}
 */
export async function fetchUserAccess(userId) {
    if (!userId) throw new Error('UserId wajib diberikan');
    return authFetch(`/api/UserAccess/${userId}`);
}

/**
 * Memberikan whitelist aplikasi kepada user.
 * POST /api/UserAccess
 * Body: { userId: string, applicationId: string, accessLevel: string }
 */
export async function grantUserAccess(userId, applicationId, accessLevel) {
    if (!userId || !applicationId || !accessLevel) {
        throw new Error('UserId, ApplicationId, dan AccessLevel wajib diberikan');
    }

    // Normalisasi AccessLevel agar sesuai regulasi regex backend: "^(Read Only|Read And Write)$"
    let normalizedAccessLevel = accessLevel;
    if (accessLevel === 'Read & Write' || accessLevel === 'Read And Write') {
        normalizedAccessLevel = 'Read And Write';
    } else {
        normalizedAccessLevel = 'Read Only'; // default fallback
    }

    return authFetch('/api/UserAccess', {
        method: 'POST',
        body: JSON.stringify({
            userId,
            applicationId,
            accessLevel: normalizedAccessLevel,
        }),
    });
}

/**
 * Mencabut/menghapus whitelist aplikasi milik user (Soft Delete).
 * DELETE /api/UserAccess/{userId}/{applicationId}
 */
export async function revokeUserAccess(userId, applicationId) {
    if (!userId || !applicationId) {
        throw new Error('UserId dan ApplicationId wajib diberikan');
    }
    return authFetch(`/api/UserAccess/${userId}/${applicationId}`, {
        method: 'DELETE',
    });
}
