import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchServerApplicationImpact } from '../services/infrastructure';
import '../style/ServerApplicationImpact.css';

const ATTENTION = {
  Normal: { label: 'Snapshot Online', tone: 'normal' },
  Warning: { label: 'Perlu pemeriksaan', tone: 'warning' },
  Critical: { label: 'Prioritas pemeriksaan', tone: 'critical' },
  Maintenance: { label: 'Dalam pemeliharaan', tone: 'maintenance' },
  Unknown: { label: 'Kondisi belum diketahui', tone: 'unknown' },
};

function formatDate(value) {
  if (!value) return 'Belum tersedia';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Belum tersedia';

  return `${date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  })} WIB`;
}

function ApplicationRow({ app }) {
  const attention =
    ATTENTION[app.assessment?.attentionLevel] ?? ATTENTION.Unknown;

  const summary = app.serverSummary ?? {};
  const otherServers = Array.isArray(app.otherServers)
    ? app.otherServers
    : [];

  return (
    <details className="sai-app">
      <summary className="sai-app-summary">
        <div className="sai-app-heading">
          <strong>{app.name}</strong>
          <span>
            {app.sourceRelation?.function || 'Fungsi belum tersedia'}
            {' · '}
            {app.sourceRelation?.tenantAplikasi || 'Tenant belum tersedia'}
          </span>
        </div>

        <div className="sai-app-meta">
          <span className="sai-catalog-status">
            Status katalog: {app.applicationStatus || 'Belum tersedia'}
          </span>
          <span className={`sai-badge sai-${attention.tone}`}>
            {attention.label}
          </span>
        </div>

        <span className="sai-chevron" aria-hidden="true">⌄</span>
      </summary>

      <div className="sai-app-body">
        <p className="sai-assessment">
          {app.assessment?.message}
        </p>

        <div className="sai-counts">
          <span><b>{app.totalServers ?? 0}</b> total server</span>
          <span><b>{summary.online ?? 0}</b> Online</span>
          <span><b>{summary.warning ?? 0}</b> Warning</span>
          <span><b>{summary.criticalOrOffline ?? 0}</b> Critical / Offline</span>
          <span><b>{summary.maintenance ?? 0}</b> Maintenance</span>
          <span><b>{summary.unknown ?? 0}</b> Unknown</span>
        </div>

        <p className="sai-caption">
          Ringkasan mencakup server yang sedang kamu periksa.
        </p>

        <h3>Server pendukung lainnya</h3>

        <p className="sai-caption">
          {app.assessment?.supportingServerNote}
        </p>

        {otherServers.length > 0 && (
          <div
            className="sai-table-wrap"
            role="region"
            aria-label={`Server pendukung ${app.name}`}
            tabIndex={0}
          >
            <table className="sai-table">
              <thead>
                <tr>
                  <th scope="col">Server / lokasi</th>
                  <th scope="col">Peran / tenant</th>
                  <th scope="col">Status snapshot</th>
                </tr>
              </thead>

              <tbody>
                {otherServers.map((item) => (
                  <tr key={item.serverId}>
                    <td>
                      <strong>{item.hostname}</strong>
                      <small>{item.deviceIpAddress}</small>
                      <small>
                        {item.dataCenterName} · {item.city}
                      </small>
                    </td>
                    <td>
                      <strong>{item.function || '-'}</strong>
                      <small>{item.tenantAplikasi || '-'}</small>
                      <small>Environment: {item.environment || '-'}</small>
                    </td>
                    <td>
                      <span
                        className="sai-server-status"
                        data-status={item.status}
                      >
                        {item.status || 'Unknown'}
                      </span>
                      <small>{formatDate(item.lastChecked)}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="sai-app-footer">
          <span>Dampak layanan dan kesiapan cadangan belum terverifikasi.</span>
          <Link to={`/applications/${app.applicationId}`}>
            Buka profil aplikasi →
          </Link>
        </div>
      </div>
    </details>
  );
}

export default function ServerApplicationImpact({ serverId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');
    setData(null);

    async function load() {
      try {
        const result = await fetchServerApplicationImpact(serverId);

        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Gagal memuat analisis dampak.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [serverId, retryKey]);

  const attention =
    ATTENTION[data?.sourceAttentionLevel] ?? ATTENTION.Unknown;

  const keyword = search.trim().toLowerCase();

  const applications = (data?.applications ?? []).filter((app) =>
    [
      app.name,
      app.applicationStatus,
      app.sourceRelation?.tenantAplikasi,
      app.sourceRelation?.function,
    ]
      .join(' ')
      .toLowerCase()
      .includes(keyword)
  );

  return (
    <section className="sd-card sai-panel" aria-labelledby="sai-title">
      <div className="sai-heading">
        <div>
          <span className="sai-eyebrow">HUBUNGAN INFRASTRUKTUR</span>
          <h2 id="sai-title">Potensi dampak ke aplikasi</h2>
          <p>
            Periksa aplikasi terkait dan server pendukungnya sebelum
            menyimpulkan dampak terhadap layanan.
          </p>
        </div>

        {data && !loading && !error && (
          <span className="sai-total">
            {data.totalLinkedApplications} aplikasi terkait
          </span>
        )}
      </div>

      {loading ? (
        <p className="sai-state" role="status">
          Memuat analisis dampak…
        </p>
      ) : error ? (
        <div className="sai-state" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="sd-button"
            onClick={() => setRetryKey((value) => value + 1)}
          >
            Coba lagi
          </button>
        </div>
      ) : data ? (
        <>
          <div className={`sai-source sai-${attention.tone}`}>
            <div>
              <strong>{data.sourceServer.hostname}</strong>
              <span>
                Status server: {data.sourceServer.status}
                {' · '}
                {data.sourceServer.dataCenterName}
              </span>
            </div>

            <span className={`sai-badge sai-${attention.tone}`}>
              {attention.label}
            </span>
          </div>

          <p className="sai-caption">
            Snapshot demo · {formatDate(data.sourceServer.lastChecked)}.
            Penilaian mengikuti status tersimpan, bukan pemeriksaan layanan
            secara langsung.
          </p>

          {data.applications.length > 0 ? (
            <>
              <div className="sai-search">
                <label htmlFor="sai-search">Cari aplikasi terkait</label>
                <input
                  id="sai-search"
                  type="search"
                  placeholder="Nama aplikasi, tenant, fungsi, atau status katalog…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <p className="sai-caption" role="status">
                {applications.length} dari {data.applications.length} aplikasi.
                Klik baris untuk melihat server pendukung.
              </p>

              <div className="sai-list">
                {applications.map((app) => (
                  <ApplicationRow key={app.applicationId} app={app} />
                ))}
              </div>

              {applications.length === 0 && (
                <p className="sai-state">
                  Tidak ada aplikasi yang cocok dengan pencarian.
                </p>
              )}
            </>
          ) : (
            <p className="sai-state">
              Belum ada aplikasi yang tercatat pada server ini.
            </p>
          )}
        </>
      ) : null}
    </section>
  );
}