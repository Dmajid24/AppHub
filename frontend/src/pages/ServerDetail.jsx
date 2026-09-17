import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ServerApplicationImpact from '../components/ServerApplicationImpact';
import Layout from '../components/layout';
import { fetchServerDetail } from '../services/infrastructure';
import '../style/ServerDetail.css';

const STATUS = {
  Online: { label: 'Sehat', className: 'healthy' },
  Warning: { label: 'Warning', className: 'warning' },
  Critical: { label: 'Kritis', className: 'critical' },
  Offline: { label: 'Offline', className: 'unknown' },
  Maintenance: { label: 'Maintenance', className: 'maintenance' },
};

const PAGE_SIZE = 10;

function formatNumber(value) {
  return value == null
    ? '-'
    : Number(value).toLocaleString('id-ID');
}

function UsageCard({ label, value }) {
  const available = value != null && Number.isFinite(Number(value));
  const percentage = available
    ? Math.max(0, Math.min(100, Number(value)))
    : 0;

  return (
    <div className="sd-metric">
      <span>{label}</span>
      <strong>{available ? `${formatNumber(value)}%` : '-'}</strong>

      <div
        className="sd-meter"
        role={available ? 'meter' : undefined}
        aria-label={label}
        aria-valuemin={available ? 0 : undefined}
        aria-valuemax={available ? 100 : undefined}
        aria-valuenow={available ? percentage : undefined}
      >
        <div style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default function ServerDetail() {
  const { id } = useParams();
  const location = useLocation();

  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Akan diisi dari map saat navigasinya disambungkan.
  const returnTo = location.state?.returnTo;

  const backUrl =
    typeof returnTo === 'string' &&
    ['/dashboard', '/infrastructure'].some(path => returnTo === path || returnTo.startsWith(`${path}?`))
      ? returnTo
      : '/infrastructure';

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');
    setServer(null);
    setSearch('');
    setPage(1);

    async function load() {
      try {
        const result = await fetchServerDetail(id);

        if (!cancelled) {
          setServer(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Gagal memuat detail server.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const keyword = search.trim().toLowerCase();

  const applications = (server?.applications ?? []).filter((app) =>
    [
      app.name,
      app.category,
      app.tenantAplikasi,
      app.function,
      app.status,
    ]
      .join(' ')
      .toLowerCase()
      .includes(keyword)
  );

  const totalPages = Math.max(
    1,
    Math.ceil(applications.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const visibleApplications = applications.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const status = STATUS[server?.status] ?? {
    label: server?.status || 'Belum diketahui',
    className: 'unknown',
  };

  const checkedAt = server?.lastChecked
    ? new Date(server.lastChecked)
    : null;

  const checkedLabel =
    checkedAt && !Number.isNaN(checkedAt.getTime())
      ? checkedAt.toLocaleString('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Jakarta',
        }) + ' WIB'
      : '-';

  const identity = server
    ? [
        ['Server Name', server.serverName],
        ['Hostname', server.hostname],
        ['Device IP Address', server.deviceIpAddress],
        ['Device Type', server.deviceType],
        ['Device Type Name', server.deviceTypeName],
        ['OS', server.os],
        ['Environment', server.environment],
        ['Rack', server.rack],
        [
          'CPU',
          server.cpuCore == null
            ? '-'
            : `${formatNumber(server.cpuCore)} ${
                server.deviceType?.replace(/\s+/g, ' ').trim() ===
                'Virtual Machine'
                  ? 'vCPU'
                  : 'core'
              }`,
        ],
        ['Memory', `${formatNumber(server.memoryGB)} GB`],
        ['Disk', `${formatNumber(server.diskGB)} GB`],
        ['Data Center', server.dataCenter?.name],
        ['Kota', server.dataCenter?.city],
        ['Alamat DC', server.dataCenter?.address],
      ]
    : [];

  return (
    <Layout>
      <main className="sd-page">
        <Link className="sd-back" to={backUrl}>
          ← Kembali ke {backUrl.startsWith('/infrastructure') ? 'Infrastructure Visibility' : 'dashboard'}
        </Link>

        {loading ? (
          <div className="sd-card sd-state" role="status">
            Memuat detail server...
          </div>
        ) : error ? (
          <div className="sd-card sd-state" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="sd-button"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              Coba lagi
            </button>
          </div>
        ) : server ? (
          <>
            <header className="sd-card sd-header">
              <div>
                <span className="sd-eyebrow">DETAIL SERVER</span>
                <h1>{server.hostname || server.serverName || 'Detail server'}</h1>
                <p>
                  {server.deviceIpAddress} · {server.dataCenter?.name}
                </p>

                {server.description && (
                  <p className="sd-description">{server.description}</p>
                )}
              </div>

              <span className={`sd-badge sd-badge-${status.className}`}>
                {status.label}
              </span>
            </header>
            <ServerApplicationImpact
              key={server.serverId}
              serverId={server.serverId}
            />

            <section className="sd-card" aria-labelledby="sd-health-title">
              <div className="sd-section-heading">
                <div>
                  <h2 id="sd-health-title">Kesehatan server</h2>
                  <p>Snapshot demo · Terakhir diperiksa: {checkedLabel}</p>
                </div>
              </div>

              <div className="sd-metrics">
                <UsageCard label="CPU usage" value={server.cpuUsage} />
                <UsageCard label="Memory usage" value={server.memoryUsage} />
                <UsageCard label="Disk usage" value={server.diskUsage} />

                <div className="sd-metric">
                  <span>Availability</span>
                  <strong>{formatNumber(server.availability)}%</strong>
                </div>

                <div className="sd-metric">
                  <span>Response time</span>
                  <strong>
                    {formatNumber(server.responseTimeMs)}
                    <small> ms</small>
                  </strong>
                </div>
              </div>

              <p className="sd-note">
                Persentase menunjukkan penggunaan resource.
                Kapasitas terpasang tersedia pada informasi device.
              </p>
            </section>

            <section className="sd-card" aria-labelledby="sd-device-title">
              <div className="sd-section-heading">
                <h2 id="sd-device-title">Informasi device</h2>
              </div>

              <dl className="sd-identity">
                {identity.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || '-'}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="sd-card" aria-labelledby="sd-apps-title">
              <div className="sd-section-heading">
                <div>
                  <h2 id="sd-apps-title">Aplikasi pada server</h2>
                  <p>
                    Daftar aplikasi yang terhubung dengan {server.hostname}.
                  </p>
                </div>

                <span className="sd-count">
                  {server.totalApplications} aplikasi
                </span>
              </div>

              <div className="sd-search">
                <label htmlFor="sd-app-search">Cari aplikasi</label>
                <input
                  id="sd-app-search"
                  type="search"
                  placeholder="Nama aplikasi, tenant, function, atau status..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div
                className="sd-table-wrap"
                role="region"
                aria-label="Daftar aplikasi pada server"
                tabIndex={0}
              >
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th scope="col">No</th>
                      <th scope="col">Nama aplikasi</th>
                      <th scope="col">Tenant</th>
                      <th scope="col">Function</th>
                      <th scope="col">Status</th>
                      <th scope="col">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="sd-empty">
                          {server.applications.length === 0
                            ? 'Belum ada aplikasi yang terhubung.'
                            : 'Tidak ada aplikasi yang cocok dengan pencarian.'}
                        </td>
                      </tr>
                    ) : (
                      visibleApplications.map((app, index) => (
                        <tr key={app.applicationId}>
                          <td>{startIndex + index + 1}</td>
                          <td>
                            <strong>{app.name}</strong>
                            <small className="sd-app-category">
                              {app.category}
                            </small>
                          </td>
                          <td>{app.tenantAplikasi || '-'}</td>
                          <td>{app.function || '-'}</td>
                          <td>
                            <span className="sd-app-status" data-status={app.status}>
                                {app.status}
                            </span>
                          </td>
                          <td>
                            <Link
                              className="sd-app-link"
                              to={`/applications/${app.applicationId}`}
                            >
                              Lihat aplikasi →
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="sd-pagination">
                <span role="status">
                  {applications.length === 0
                    ? '0 aplikasi'
                    : `${startIndex + 1}–${Math.min(
                        startIndex + PAGE_SIZE,
                        applications.length
                      )} dari ${applications.length} aplikasi`}
                </span>

                {totalPages > 1 && (
                  <div className="sd-pagination-actions">
                    <button
                      type="button"
                      className="sd-button"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      Sebelumnya
                    </button>

                    <span>
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      className="sd-button"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Berikutnya
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </Layout>
  );
}