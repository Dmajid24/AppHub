import { useEffect, useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { ArrowLeft, Boxes, Server } from 'lucide-react';

import Layout from '../../components/Layout';
import DetailStateWrapper from './DetailStateWrapper';
import { fetchApplicationById } from '../../services/applications';
import { fetchApplicationServers } from '../../services/infrastructure';

import '../../style/app_portofolio_style/App_Profile_Style.css';
import '../../style/app_portofolio_style/Tech_Info_Style.css';

const statusColor = {
  Active: 'badge-active',
  Maintenance: 'badge-maintenance',
  Inactive: 'badge-inactive',
  Pending: 'badge-maintenance',
};

function AppDetailTabs({ id }) {
  const { pathname } = useLocation();

  const tabs = [
    { label: 'Profile', path: `/applications/${id}` },
    { label: 'Architecture', path: `/applications/${id}/architecture` },
    {
      label: 'Compliance & Security',
      path: `/applications/${id}/compliance-security`,
    },
    { label: 'Tech Info', path: `/applications/${id}/tech-info` },
    { label: 'App View', path: `/applications/${id}/app-view` },
  ];

  return (
    <div className="profile-tabs" aria-label="Detail aplikasi">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={`profile-tab ${pathname === tab.path ? 'active' : ''}`}
          aria-current={pathname === tab.path ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export default function TechInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [app, setApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [servers, setServers] = useState([]);
  const [serversLoading, setServersLoading] = useState(true);
  const [serversError, setServersError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [locationId, setLocationId] = useState('');

  useEffect(() => {
    let cancelled = false;

    setApp(null);
    setIsLoading(true);
    setError(null);

    setServers([]);
    setServersLoading(true);
    setServersError(null);

    setSearch('');
    setLocationId('');

    async function loadApplication() {
      try {
        const result = await fetchApplicationById(id);

        if (!cancelled) {
          setApp(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Gagal memuat aplikasi.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    async function loadServers() {
      try {
        const result = await fetchApplicationServers(id);

        if (!cancelled) {
          setServers(result);
        }
      } catch (err) {
        if (!cancelled) {
          setServersError(err.message || 'Gagal memuat daftar server.');
        }
      } finally {
        if (!cancelled) {
          setServersLoading(false);
        }
      }
    }

    loadApplication();
    loadServers();

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const locations = Array.from(
    new Map(
      servers.map((server) => [
        server.dataCenterId,
        {
          id: server.dataCenterId,
          name: server.serverLocation,
        },
      ])
    ).values()
  ).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

  const keyword = search.trim().toLowerCase();

  const filteredServers = servers.filter((server) => {
    const matchesLocation =
      !locationId || server.dataCenterId === locationId;

    const searchableText = [
      server.tenantAplikasi,
      server.deviceIpAddress,
      server.deviceType,
      server.deviceTypeName,
      server.os,
      server.function,
      server.serverLocation,
      server.city,
      server.hostname,
    ]
      .join(' ')
      .toLowerCase();

    return matchesLocation && searchableText.includes(keyword);
  });

  return (
    <DetailStateWrapper
      isLoading={isLoading}
      error={error}
      notFound={!isLoading && !error && !app}
      onBack={() => navigate('/applications')}
    >
      {app && (
        <Layout>
          <div className="app-profile-content">
            <button
              type="button"
              className="profile-back-btn"
              onClick={() => navigate('/applications')}
            >
              <ArrowLeft size={16} strokeWidth={2} />
              Kembali ke App Portofolio
            </button>

            <div className="profile-header-card">
              <div className="profile-header-top">
                <div className="profile-header-icon">
                  <Boxes size={28} strokeWidth={2} color="#FFFFFF" />
                </div>

                <span
                  className={`status-badge ${
                    statusColor[app.status] ?? 'badge-inactive'
                  }`}
                >
                  {app.status}
                </span>
              </div>

              <h1 className="profile-app-name">{app.name}</h1>
              <p className="profile-app-description">{app.description}</p>
            </div>

            <AppDetailTabs id={id} />

            <section
              className="section-card tech-server-section"
              aria-labelledby="tech-server-title"
            >
              <div className="tech-server-heading">
                <div>
                  <h2 id="tech-server-title">
                    <Server size={19} />
                    Server / Device
                  </h2>
                  <p>
                    Daftar server dan device yang menjalankan aplikasi ini.
                  </p>
                </div>

                {!serversLoading && !serversError && (
                  <span className="tech-server-count">
                    {servers.length} device
                  </span>
                )}
              </div>

              {serversLoading ? (
                <div className="tech-server-state" role="status">
                  Memuat daftar server...
                </div>
              ) : serversError ? (
                <div
                  className="tech-server-state tech-server-error"
                  role="alert"
                >
                  <p>{serversError}</p>
                  <button
                    type="button"
                    className="tech-server-button"
                    onClick={() => setReloadKey((value) => value + 1)}
                  >
                    Coba lagi
                  </button>
                </div>
              ) : servers.length === 0 ? (
                <div className="tech-server-state">
                  Belum ada server yang terhubung dengan aplikasi ini.
                </div>
              ) : (
                <>
                  <div className="tech-server-toolbar">
                    <div className="tech-server-field tech-server-search">
                      <label htmlFor="tech-server-search">
                        Cari server
                      </label>
                      <input
                        id="tech-server-search"
                        type="search"
                        placeholder="IP, hostname, tenant, atau function..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </div>

                    <div className="tech-server-field">
                      <label htmlFor="tech-server-location">
                        Server Location
                      </label>
                      <select
                        id="tech-server-location"
                        value={locationId}
                        onChange={(event) =>
                          setLocationId(event.target.value)
                        }
                      >
                        <option value="">Semua lokasi</option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    className="tech-server-table-wrap"
                    role="region"
                    aria-label="Tabel server aplikasi, dapat digulir"
                    tabIndex={0}
                  >
                    <table className="tech-server-table">
                      <caption className="tech-server-sr-only">
                        Server dan device untuk {app.name}
                      </caption>

                      <thead>
                        <tr>
                          <th scope="col">No</th>
                          <th scope="col">Tenant Aplikasi</th>
                          <th scope="col">Device IP Address</th>
                          <th scope="col">Device Type</th>
                          <th scope="col">Device Type Name</th>
                          <th scope="col">OS</th>
                          <th scope="col">Function</th>
                          <th scope="col">CPU</th>
                          <th scope="col">Memory (GB)</th>
                          <th scope="col">Disk (GB)</th>
                          <th scope="col">Server Location</th>
                          <th scope="col">Hostname</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredServers.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="tech-server-no-match">
                              Tidak ada server yang cocok dengan pencarian.
                            </td>
                          </tr>
                        ) : (
                          filteredServers.map((server, index) => (
                            <tr key={server.serverId}>
                              <td>{index + 1}</td>
                              <td>{server.tenantAplikasi || '-'}</td>
                              <td className="tech-server-mono">
                                {server.deviceIpAddress || '-'}
                              </td>
                              <td>{server.deviceType || '-'}</td>
                              <td>{server.deviceTypeName || '-'}</td>
                              <td>{server.os || '-'}</td>
                              <td>{server.function || '-'}</td>
                              <td className="tech-server-number">
                                {server.cpuCore == null
                                  ? '-'
                                  : `${server.cpuCore} ${
                                      server.deviceType === 'Virtual Machine'
                                        ? 'vCPU'
                                        : 'core'
                                    }`}
                              </td>
                              <td className="tech-server-number">
                                {server.memoryGB ?? '-'}
                              </td>
                              <td className="tech-server-number">
                                {server.diskGB ?? '-'}
                              </td>
                              <td>{server.serverLocation || '-'}</td>
                              <td className="tech-server-mono">
                                {server.hostname || '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="tech-server-footer" role="status">
                    Menampilkan {filteredServers.length} dari {servers.length}{' '}
                    device
                  </div>
                </>
              )}
            </section>
          </div>
        </Layout>
      )}
    </DetailStateWrapper>
  );
}