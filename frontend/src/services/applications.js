import { authFetch } from './api';

export function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

// -----------------------------------------------------------------
// Normalisasi satu object Application dari backend (.NET) ke shape
// flat yang dipakai di seluruh halaman app_portofolio.
// -----------------------------------------------------------------
export function normalizeApp(app) {
    if (!app) return null;
    return {
        id: app.id,
        name: app.namaAplikasi ?? 'Tanpa nama',
        description: app.description ?? '',
        category: app.category ?? 'Uncategorized',
        owner: app.pemilik?.nama ?? app.pemilik?.username ?? '-',
        creator: app.pembuat?.nama ?? app.pembuat?.username ?? '-',
        backupOwner: app.backupPemilik?.nama ?? app.backupPemilik?.username ?? '-',
        status: app.status ?? 'Active',
        updated: formatTanggal(app.lastUpdated ?? app.createdAt),
        version: app.version ?? '-',
        url: app.applicationUrl ?? '',
        uptime: app.uptime ? `${app.uptime}%` : '-',
        server: app.server?.serverName ?? '-',
        database: app.database ?? '-',
        region: app.server?.region ?? '-',
        dataClassification: app.dataClassification ?? '-',
        dataSource: app.dataSource ?? '-',
        dataRetentionPolicy: app.dataRetentionPolicy ?? '-',
        techStack: app.technologyStack
            ? app.technologyStack.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
        // Field berikut belum ada di model backend saat ini (Application.cs).
        // Dibiarkan undefined supaya UI otomatis menyembunyikannya
        // (semua halaman detail sudah .filter(item => item.value)).
        documentation: app.documentation,
        supportContact: app.supportContact,
        architectureType: app.architectureType,
        hostingProvider: app.hostingProvider,
        deploymentModel: app.deploymentModel,
        integrations: app.integrations ?? [],
        dependencies: app.dependencies ?? [],
        architectureNotes: app.architectureNotes,
        lastSecurityAudit: app.lastSecurityAudit,
        encryptionAtRest: app.encryptionAtRest,
        encryptionInTransit: app.encryptionInTransit,
        accessControl: app.accessControl,
        vulnerabilityStatus: app.vulnerabilityStatus,
        complianceStandards: app.complianceStandards ?? [],
        piiHandling: app.piiHandling,
        framework: app.framework,
        language: app.language,
        repository: app.repository,
        cicdPipeline: app.cicdPipeline,
        apiDocumentation: app.apiDocumentation,
        sla: app.sla,
        _raw: app,
    };
}

export async function fetchApplications() {
    const data = await authFetch('/api/Applications');
    return Array.isArray(data) ? data.map(normalizeApp) : [];
}

export async function fetchApplicationById(id) {
    const data = await authFetch(`/api/Applications/${id}`);
    return normalizeApp(data);
}